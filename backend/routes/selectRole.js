const { analyzeSkillGap } = require('../services/skillMatcher');
const { compressForAI } = require('../services/tokenCompressor');
const { getSession, updateSession } = require('../services/dbHelper');

/**
 * Handle POST /api/select-role
 * User has picked a recommended role. Run local skill gap analysis and store selection.
 */
async function handleSelectRole(req, res) {
  try {
    const { session_id, selected_role, custom_role } = req.body;

    if (!session_id || !selected_role) {
      return res.status(400).json({ error: 'session_id and selected_role are required' });
    }

    // Validate custom role if provided
    if (custom_role) {
      if (typeof custom_role !== 'string' || custom_role.trim().length < 2 || custom_role.trim().length > 100) {
        return res.status(400).json({ error: 'Custom role must be between 2 and 100 characters.' });
      }
    }

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const resumeData = user.resume_data;
    if (!resumeData) return res.status(400).json({ error: 'Resume data not found in session.' });

    console.log(`[select-role] Session ${session_id} selected role: ${selected_role} (Custom: ${custom_role || 'none'})`);

    // Collect all user skills for local gap analysis
    const allUserSkills = [
      ...(resumeData.technical_skills || []),
      ...(resumeData.tools_and_frameworks || []),
    ];

    // Local skill gap analysis — ZERO tokens
    let gapAnalysis;
    const roleDatasets = require('../data/roleDatasets.json');
    let datasetRole = null;
    const normalizedRole = selected_role.toLowerCase();

    // Look for matches in predefined datasets
    let datasetRoleKey = null;
    for (const key of Object.keys(roleDatasets)) {
      if (normalizedRole.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedRole)) {
        datasetRole = roleDatasets[key];
        datasetRoleKey = key;
        break;
      }
    }

    if (!datasetRole) {
      // Look for technology tags
      if (normalizedRole.includes('devops') || normalizedRole.includes('sre') || normalizedRole.includes('infrastructure')) {
        datasetRole = roleDatasets['DevOps Engineer'];
        datasetRoleKey = 'DevOps Engineer';
      } else if (normalizedRole.includes('cloud') || normalizedRole.includes('aws') || normalizedRole.includes('azure') || normalizedRole.includes('gcp') || normalizedRole.includes('architect')) {
        datasetRole = roleDatasets['Cloud Engineer'];
        datasetRoleKey = 'Cloud Engineer';
      } else if (normalizedRole.includes('ai') || normalizedRole.includes('ml') || normalizedRole.includes('nlp') || normalizedRole.includes('machine learning') || normalizedRole.includes('llm') || normalizedRole.includes('intelligence') || normalizedRole.includes('quant')) {
        datasetRole = roleDatasets['AI Engineer'];
        datasetRoleKey = 'AI Engineer';
      } else if (normalizedRole.includes('data') || normalizedRole.includes('analyst') || normalizedRole.includes('analytics')) {
        datasetRole = roleDatasets['Data Analyst'];
        datasetRoleKey = 'Data Analyst';
      } else if (normalizedRole.includes('backend') || normalizedRole.includes('node') || normalizedRole.includes('python') || normalizedRole.includes('java') || normalizedRole.includes('golang') || normalizedRole.includes('c++') || normalizedRole.includes('rust')) {
        datasetRole = roleDatasets['Backend Engineer'];
        datasetRoleKey = 'Backend Engineer';
      } else if (normalizedRole.includes('frontend') || normalizedRole.includes('react') || normalizedRole.includes('web') || normalizedRole.includes('ui') || normalizedRole.includes('ux') || normalizedRole.includes('javascript') || normalizedRole.includes('html')) {
        datasetRole = roleDatasets['Frontend Developer'];
        datasetRoleKey = 'Frontend Developer';
      }
    }

    if (datasetRole) {
      // Perform local analysis using matched dataset role
      gapAnalysis = analyzeSkillGap(allUserSkills, datasetRoleKey);
      gapAnalysis.target_role = selected_role;
    } else {
      // Define a custom dynamic dataset fallback
      const defaultSkills = ['Problem Solving', 'Git', 'System Design', 'Communication', 'Agile', 'APIs'];
      const defaultNiceToHave = ['Docker', 'CI/CD', 'Cloud Platforms', 'Unit Testing'];
      
      const matchingSkills = defaultSkills.filter(ds => 
        allUserSkills.some(us => us.toLowerCase().includes(ds.toLowerCase()) || ds.toLowerCase().includes(us.toLowerCase()))
      );
      const missingSkills = defaultSkills.filter(ds => 
        !allUserSkills.some(us => us.toLowerCase().includes(ds.toLowerCase()) || ds.toLowerCase().includes(us.toLowerCase()))
      );
      
      const matchScore = Math.round((matchingSkills.length / defaultSkills.length) * 100);
      gapAnalysis = {
        target_role: selected_role,
        match_score: matchScore,
        ats_score: matchScore,
        matched_skills: matchingSkills,
        missing_skills: missingSkills,
        nice_to_have_gaps: defaultNiceToHave,
        nice_to_have_matched: [],
        total_required: defaultSkills.length,
        readiness_level: matchScore >= 80 ? 'High' : matchScore >= 60 ? 'Medium' : matchScore >= 40 ? 'Low' : 'Very Low',
        role_info: {
          description: `Specialized role focusing on ${selected_role}.`,
          top_companies: ['Google', 'Amazon', 'Microsoft', 'Atlassian'],
          interview_topics: ['Core Architecture', 'Design Patterns', 'System Reliability', 'Testing'],
          avg_salary_lpa: { fresher: '5-9', junior: '9-16', mid: '16-32', senior: '32-65' },
          avg_salary_usd: { fresher: '55k-80k', junior: '80k-110k', mid: '110k-150k', senior: '150k-220k' }
        }
      };
    }

    // Compress profile for future LLM calls
    const compressed = compressForAI(resumeData, selected_role);

    // Persist selected role, custom role, and analysis results
    await updateSession(session_id, {
      selected_role,
      target_role: selected_role,
      custom_role: custom_role || null,
      gap_analysis: gapAnalysis,
      // Clear previous cached recommendations/results
      career_simulation: null,
      roadmap: null,
      courses: null,
      resume_optimization: null,
      quiz_questions: null,
      quiz_id: null,
      quiz_score: null,
      quiz_overall_score: null,
      quiz_review: null,
      quiz_per_skill_scores: null,
      interview_score: null,
      career_readiness_score: null,
      'interview.history': null,
      'interview.concluded': false,
      'interview.scorecard': null
    });

    res.json({
      success: true,
      selected_role,
      custom_role: custom_role || null,
      gap_analysis: gapAnalysis,
      compressed_profile: compressed,
    });

  } catch (err) {
    console.error('[select-role] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to select role' });
  }
}

module.exports = { handleSelectRole };
