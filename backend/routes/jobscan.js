const { verifyToken } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const JobScan = require('../models/JobScan');
const JobDescriptionAnalysis = require('../models/JobDescriptionAnalysis');
const { isDbConnected, updateSession } = require('../services/dbHelper');
const { rateLimiter } = require('../middleware/rateLimitMiddleware');
const { normalizeSkill } = require('../services/skillMatcher');
const roleDatasets = require('../data/roleDatasets.json');
const { generateOptimizeSuggestions } = require('../services/aiService');

// Extract all unique skills from roleDatasets.json to create a matching vocabulary
const skillVocabulary = new Set();
Object.values(roleDatasets).forEach(role => {
  if (Array.isArray(role.required_skills)) {
    role.required_skills.forEach(s => skillVocabulary.add(s));
  }
  if (Array.isArray(role.nice_to_have)) {
    role.nice_to_have.forEach(s => skillVocabulary.add(s));
  }
});
const skillsList = Array.from(skillVocabulary);

/**
 * Handle POST /api/jobmatch
 */
async function handleJobMatch(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return;

  // Rate Limiting
  const allowed = await rateLimiter(req, res, 'ats');
  if (!allowed) return;

  const { job_description, manual_requirements, target_role, custom_role } = req.body;

  try {
    // 1. Fetch user's latest resume
    let resume = null;
    if (isDbConnected()) {
      resume = await Resume.findOne({ user_id: userId }).sort({ created_at: -1 });
    } else {
      // Fallback: read from in-memory session cache
      const sessionStore = require('../services/sessionStore');
      const fallbackSession = sessionStore.findOne(userId);
      if (fallbackSession && fallbackSession.resume_data) {
        resume = {
          extracted_skills: fallbackSession.resume_data.technical_skills || [],
          extracted_projects: fallbackSession.resume_data.projects || [],
          extracted_experience: fallbackSession.resume_data.experience || [],
          extracted_education: fallbackSession.resume_data.education || [],
          extracted_certifications: fallbackSession.resume_data.certifications || []
        };
      }
    }

    if (!resume) {
      return res.status(400).json({ error: 'No resume found. Please upload a resume first.' });
    }

    const userSkills = resume.extracted_skills || [];
    const userCertifications = resume.extracted_certifications || [];
    const userExperience = resume.extracted_experience || [];

    let targetRoleName = '';
    let jobSkills = [];
    let requiredExp = '';
    let requiredCerts = [];
    let jdTextForSuggestions = '';

    // 2. Perform Local Parsing & Matching
    if (job_description) {
      jdTextForSuggestions = job_description;
      // Extract skills from JD text using vocabulary
      const jdLower = job_description.toLowerCase();
      skillsList.forEach(skill => {
        const normalized = skill.toLowerCase();
        // Match word boundary to avoid false positives (e.g. "Go" matching in "Good")
        const regex = new RegExp(`\\b${normalized.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(jdLower)) {
          jobSkills.push(skill);
        }
      });

      // Simple heuristic for experience years requested
      const expMatch = jdLower.match(/(\d+)\+?\s*(?:years|yr|yrs|year)\b/);
      requiredExp = expMatch ? `${expMatch[1]}+ years` : 'Not specified';
      
      // Simple heuristic for certifications
      const certKeywords = ['aws', 'certified', 'pmp', 'cism', 'cissp', 'ccna', 'itil', 'gcp', 'azure'];
      certKeywords.forEach(kw => {
        if (jdLower.includes(kw)) {
          requiredCerts.push(kw.toUpperCase());
        }
      });
      targetRoleName = 'Job Description Role';
    } else if (manual_requirements) {
      targetRoleName = manual_requirements.role || 'Target Role';
      jdTextForSuggestions = `Role: ${targetRoleName}. Required Skills: ${manual_requirements.skills}. Experience: ${manual_requirements.experience}. Certifications: ${manual_requirements.certifications}`;
      
      if (manual_requirements.skills) {
        jobSkills = String(manual_requirements.skills)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
      requiredExp = manual_requirements.experience || 'Not specified';
      if (manual_requirements.certifications) {
        requiredCerts = String(manual_requirements.certifications)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
    } else {
      return res.status(400).json({ error: 'Please provide a job description or manual requirements.' });
    }

    // Default fallbacks if no skills extracted
    if (jobSkills.length === 0) {
      jobSkills = ['Communication', 'Problem Solving'];
    }

    // Calculate matches and gaps locally
    const matchingSkills = jobSkills.filter(js =>
      userSkills.some(us => us.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(us.toLowerCase()))
    );

    const missingSkills = jobSkills.filter(js =>
      !userSkills.some(us => us.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(us.toLowerCase()))
    );

    const matchScore = Math.round((matchingSkills.length / Math.max(jobSkills.length, 1)) * 100);
    
    // ATS Score: match score weighted at 70%, experience overlap 15%, certifications 15%
    let expScore = 100; // default if not specified
    if (requiredExp && requiredExp !== 'Not specified') {
      const expYearsReq = parseInt(requiredExp);
      const userYears = userExperience.length * 2; // Rough estimate of 2 years per experience item if not specified
      if (!isNaN(expYearsReq) && userYears < expYearsReq) {
        expScore = Math.round((userYears / expYearsReq) * 100);
      }
    }
    
    let certScore = 100;
    const missingCerts = requiredCerts.filter(rc =>
      !userCertifications.some(uc => uc.toLowerCase().includes(rc.toLowerCase()))
    );
    if (requiredCerts.length > 0) {
      certScore = Math.round(((requiredCerts.length - missingCerts.length) / requiredCerts.length) * 100);
    }

    const atsScore = Math.min(100, Math.round((matchScore * 0.7) + (expScore * 0.15) + (certScore * 0.15)));

    // Missing keywords: missing skills + other key terms
    const missingKeywords = [...missingSkills, ...missingCerts];

    // 3. AI - Generate resume improvement suggestions using the optimizer helper
    let suggestions = [];
    try {
      if (missingSkills.length > 0) {
        const currentResumeData = {
          skills: userSkills,
          experience: userExperience,
          certifications: userCertifications
        };
        const aiResponse = await generateOptimizeSuggestions(targetRoleName, missingSkills.slice(0, 5), currentResumeData);
        if (aiResponse && Array.isArray(aiResponse.suggestions)) {
          suggestions = aiResponse.suggestions.map(s => 
            `For skill "${s.skill}": Change bullet point to: "${s.optimized_bullet_suggestion}" (${s.impact_metric || 'high impact'})`
          );
        }
      }
    } catch (err) {
      console.warn('[jobmatch] AI suggestions failed, using local suggestions fallback:', err.message);
    }

    if (suggestions.length === 0) {
      // Local fallback suggestions
      suggestions = missingSkills.slice(0, 3).map(skill => 
        `Add concrete evidence or project bullets highlighting your experience with ${skill}.`
      );
      if (missingCerts.length > 0) {
        suggestions.push(`Consider obtaining the following certifications: ${missingCerts.join(', ')}.`);
      }
    }

    // 4. Persist job scan
    const scanData = {
      user_id: userId,
      job_description: jdTextForSuggestions,
      match_score: matchScore,
      ats_score: atsScore,
      matching_skills: matchingSkills,
      missing_skills: missingSkills,
      missing_keywords: missingKeywords,
      suggestions: suggestions
    };

    if (isDbConnected()) {
      await JobScan.create(scanData);
      
      if (job_description) {
        await JobDescriptionAnalysis.create({
          userId,
          jobDescription: job_description,
          targetRole: target_role || 'Pasted Job Description',
          customRole: custom_role || null,
          atsScore,
          matchScore,
          missingSkills,
          missingKeywords,
          certificationGap: missingCerts,
          experienceGap: requiredExp,
          recommendations: suggestions,
          strengths: matchingSkills.map(s => `Proficiency in ${s}`),
          improvements: missingSkills.map(s => `Develop skills in ${s}`)
        });
      }
    }

    if (job_description) {
      await updateSession(userId, {
        job_description: job_description,
        target_opportunity_option: 'paste_jd',
        custom_role: custom_role || null,
        selected_role: target_role || null
      });
    }

    res.json({
      success: true,
      match_score: matchScore,
      ats_score: atsScore,
      matching_skills: matchingSkills,
      missing_skills: missingSkills,
      missing_keywords: missingKeywords,
      certification_gap: missingCerts,
      experience_gap: requiredExp,
      suggestions: suggestions
    });

  } catch (err) {
    console.error('[jobmatch] Error in job matching:', err.message);
    res.status(500).json({ error: err.message || 'Job matching analysis failed.' });
  }
}

module.exports = { handleJobMatch };
