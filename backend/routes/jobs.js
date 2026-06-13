const { verifyToken } = require('../middleware/authMiddleware');
const { getSession, updateSession, isDbConnected } = require('../services/dbHelper');
const { rateLimiter } = require('../middleware/rateLimitMiddleware');
const SavedJob = require('../models/SavedJob');
const JobSearchHistory = require('../models/JobSearchHistory');

// Predefined lists for realistic job generation
const TECH_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Stripe', 'Atlassian', 
  'Uber', 'Airbnb', 'Vercel', 'Supabase', 'Razorpay', 'Canva', 'Linear'
];

const LOCATIONS = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 
  'Bangalore, India', 'London, UK', 'Toronto, Canada', 'Remote'
];

const SOURCES = [
  'LinkedIn', 'Indeed', 'Naukri', 'Wellfound', 'Foundit', 'Glassdoor', 
  'Greenhouse', 'Lever', 'Company Career Pages'
];

// Helper to generate a realistic salary
function generateSalary(roleName, experience) {
  const isUSD = Math.random() > 0.4;
  if (isUSD) {
    if (experience.includes('Senior') || experience.includes('5+')) {
      return '$140,000 - $190,000';
    }
    return '$90,000 - $130,000';
  } else {
    if (experience.includes('Senior') || experience.includes('5+')) {
      return '30 - 50 LPA';
    }
    return '12 - 25 LPA';
  }
}

/**
 * Handle POST /api/jobs/search
 */
async function handleJobSearch(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return;

  // Rate Limiting
  const allowed = await rateLimiter(req, res, 'jobsearch');
  if (!allowed) return;

  const { role, customRole, location, experience, remote, hybrid, onsite, salaryRange, skills } = req.body;

  try {
    const session = await getSession(userId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found. Please upload a resume first.' });
    }

    const resumeSkills = (session.resume_data?.technical_skills || []).map(s => s.toLowerCase());
    const targetRole = customRole || role || session.selected_role || 'Software Engineer';

    // 1. Gather required skills for target role from roleDatasets.json
    const roleDatasets = require('../data/roleDatasets.json');
    let targetSkills = ['Git', 'APIs', 'Problem Solving'];
    let roleDescription = 'Technical Professional';

    const normalizedRole = targetRole.toLowerCase();
    let foundDataset = null;
    for (const key of Object.keys(roleDatasets)) {
      if (normalizedRole.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedRole)) {
        foundDataset = roleDatasets[key];
        break;
      }
    }

    if (foundDataset) {
      targetSkills = foundDataset.required_skills || targetSkills;
      roleDescription = foundDataset.description || roleDescription;
    } else {
      // Tech tag fallback
      if (normalizedRole.includes('frontend') || normalizedRole.includes('react')) {
        targetSkills = roleDatasets['Frontend Developer'].required_skills;
      } else if (normalizedRole.includes('backend') || normalizedRole.includes('node')) {
        targetSkills = roleDatasets['Backend Engineer'].required_skills;
      } else if (normalizedRole.includes('ai') || normalizedRole.includes('ml')) {
        targetSkills = roleDatasets['AI Engineer'].required_skills;
      } else if (normalizedRole.includes('cloud') || normalizedRole.includes('devops')) {
        targetSkills = roleDatasets['Cloud Engineer'].required_skills;
      }
    }

    // Add search-specific skills to requirements if entered
    if (skills) {
      const splitSkills = String(skills).split(',').map(s => s.trim()).filter(Boolean);
      splitSkills.forEach(s => {
        if (!targetSkills.map(ts => ts.toLowerCase()).includes(s.toLowerCase())) {
          targetSkills.push(s);
        }
      });
    }

    // 2. Generate dynamic pool of 15 tailored job postings
    const generatedJobs = [];
    const seedMultiplier = targetRole.length + (location ? location.length : 0);

    for (let i = 0; i < 15; i++) {
      const company = TECH_COMPANIES[(seedMultiplier + i) % TECH_COMPANIES.length];
      const source = SOURCES[(seedMultiplier + i * 2) % SOURCES.length];
      
      let jobLocation = location || LOCATIONS[(seedMultiplier + i * 3) % LOCATIONS.length];
      if (jobLocation.toLowerCase() === 'remote') jobLocation = 'Remote';

      let workType = 'Onsite';
      if (jobLocation === 'Remote') {
        workType = 'Remote';
      } else {
        const types = ['Onsite', 'Hybrid', 'Remote'];
        workType = types[(seedMultiplier + i) % 3];
      }

      // Respect filters if specified
      if (remote && !hybrid && !onsite) workType = 'Remote';
      if (hybrid && !remote && !onsite) workType = 'Hybrid';
      if (onsite && !remote && !hybrid) workType = 'Onsite';

      const expRequired = experience || ((seedMultiplier + i) % 2 === 0 ? '2-5 years' : '5+ years');
      const salary = salaryRange || generateSalary(targetRole, expRequired);

      // Distribute date posted
      const daysAgo = (seedMultiplier + i) % 7;
      const postedDate = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;

      // Formulate job title
      let prefix = '';
      if (expRequired.includes('5+') || expRequired.includes('Senior')) {
        prefix = 'Senior ';
      } else if (i % 4 === 0) {
        prefix = 'Lead ';
      }
      const title = `${prefix}${targetRole}`;

      // Assemble job skills (mix of target skills + 2 random nice-to-haves)
      const jobRequiredSkills = [...targetSkills.slice(0, 5)];
      if (foundDataset && foundDataset.nice_to_have) {
        jobRequiredSkills.push(foundDataset.nice_to_have[i % foundDataset.nice_to_have.length]);
        jobRequiredSkills.push(foundDataset.nice_to_have[(i + 1) % foundDataset.nice_to_have.length]);
      } else {
        jobRequiredSkills.push('Docker', 'CI/CD');
      }

      // 3. Local calculations: Scores & Match Gaps
      const matchingSkills = jobRequiredSkills.filter(s => resumeSkills.includes(s.toLowerCase()));
      const missingSkills = jobRequiredSkills.filter(s => !resumeSkills.includes(s.toLowerCase()));

      const skillSimilarity = jobRequiredSkills.length > 0 ? matchingSkills.length / jobRequiredSkills.length : 1;
      const skillScore = Math.round(skillSimilarity * 100);

      // Experience Fit Score
      let experienceFit = 1.0;
      if (expRequired.includes('5+') && (session.resume_data?.experience?.length || 0) < 2) {
        experienceFit = 0.5; // low fit
      }

      // Recency Score (based on daysAgo)
      const recencyScore = (7 - daysAgo) / 7;

      // Local Match Score & ATS Compatibility calculation
      let matchScore = Math.round(skillScore * 0.75 + experienceFit * 25);
      if (matchScore > 100) matchScore = 100;

      let atsScore = Math.round(skillScore * 0.7 + experienceFit * 15 + (matchingSkills.length > 3 ? 15 : 5));
      if (atsScore > 100) atsScore = 100;

      // Missing keywords
      const missingKeywords = [...missingSkills];

      // Strengths & Improvements
      const strengths = [];
      const improvements = [];

      if (matchingSkills.length > 0) {
        strengths.push(`Matches core skills: ${matchingSkills.slice(0, 3).join(', ')}.`);
      }
      if (experienceFit === 1.0) {
        strengths.push('Your professional experience matches the required background.');
      }
      if (missingSkills.length > 0) {
        improvements.push(`Develop capabilities in ${missingSkills.slice(0, 2).join(', ')}.`);
      }
      improvements.push('Incorporate targeted terms to match ATS keyword parameters.');

      // Final ranking weight calculation
      const rankingScore = (matchScore * 0.45) + (atsScore * 0.3) + (skillScore * 0.15) + (experienceFit * 10) + (recencyScore * 5);

      generatedJobs.push({
        jobId: `job_${seedMultiplier}_${i}`,
        title,
        company,
        location: jobLocation,
        workType,
        experienceRequired: expRequired,
        salary,
        postedDate,
        requiredSkills: jobRequiredSkills,
        applicationSource: source,
        url: `https://www.${source.toLowerCase().replace(/\s+/g, '')}.com/jobs/apply/${seedMultiplier}_${i}`,
        analysis: {
          matchScore,
          atsScore,
          matchingSkills,
          missingSkills,
          missingKeywords,
          strengths,
          improvements
        },
        rankingScore
      });
    }

    // Apply filters strictly
    let filteredJobs = generatedJobs;

    if (location && location.trim().toLowerCase() !== 'remote' && location.trim() !== '') {
      filteredJobs = filteredJobs.filter(j => 
        j.location.toLowerCase().includes(location.toLowerCase()) || 
        location.toLowerCase().includes(j.location.toLowerCase())
      );
    }
    
    if (remote || hybrid || onsite) {
      filteredJobs = filteredJobs.filter(j => {
        if (remote && j.workType === 'Remote') return true;
        if (hybrid && j.workType === 'Hybrid') return true;
        if (onsite && j.workType === 'Onsite') return true;
        return false;
      });
    }

    // 4. Sort using the rankingScore descending
    filteredJobs.sort((a, b) => b.rankingScore - a.rankingScore);

    // Save search query history in database
    if (isDbConnected()) {
      await JobSearchHistory.create({
        userId,
        query: targetRole,
        filters: { location, experience, remote, hybrid, onsite, salaryRange, skills }
      });
    }

    res.json({
      success: true,
      jobs: filteredJobs.map(job => {
        // Strip rankingScore to avoid exposing internal calculation weights to client
        const { rankingScore, ...cleanJob } = job;
        return cleanJob;
      })
    });

  } catch (err) {
    console.error('[jobs] Search jobs error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to search jobs' });
  }
}

/**
 * Handle POST /api/jobs/save
 */
async function handleSaveJob(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return;

  const { job } = req.body;
  if (!job || !job.jobId) {
    return res.status(400).json({ error: 'Job payload and jobId are required' });
  }

  try {
    if (isDbConnected()) {
      // Toggle saved state
      const existing = await SavedJob.findOne({ userId, jobId: job.jobId });
      if (existing) {
        await SavedJob.deleteOne({ userId, jobId: job.jobId });
        return res.json({ success: true, saved: false });
      } else {
        await SavedJob.create({
          userId,
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          workType: job.workType,
          experienceRequired: job.experienceRequired,
          salary: job.salary,
          postedDate: job.postedDate,
          requiredSkills: job.requiredSkills,
          applicationSource: job.applicationSource
        });
        return res.json({ success: true, saved: true });
      }
    } else {
      // In-memory fallback
      const session = await getSession(userId);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      let savedJobs = session.saved_jobs || [];
      const index = savedJobs.findIndex(j => j.jobId === job.jobId);
      let saved = false;

      if (index > -1) {
        savedJobs.splice(index, 1);
      } else {
        savedJobs.push({
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          workType: job.workType,
          experienceRequired: job.experienceRequired,
          salary: job.salary,
          postedDate: job.postedDate,
          requiredSkills: job.requiredSkills,
          applicationSource: job.applicationSource,
          savedAt: new Date()
        });
        saved = true;
      }

      await updateSession(userId, { saved_jobs: savedJobs });
      return res.json({ success: true, saved });
    }

  } catch (err) {
    console.error('[jobs] Toggle save job error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to update saved jobs list' });
  }
}

/**
 * Handle GET /api/jobs/saved
 */
async function handleGetSavedJobs(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return;

  try {
    if (isDbConnected()) {
      const saved = await SavedJob.find({ userId }).sort({ savedAt: -1 });
      return res.json({ success: true, jobs: saved });
    } else {
      const session = await getSession(userId);
      return res.json({ success: true, jobs: session?.saved_jobs || [] });
    }
  } catch (err) {
    console.error('[jobs] Get saved jobs error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch saved jobs' });
  }
}

/**
 * Handle GET /api/jobs/history
 */
async function handleGetSearchHistory(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return;

  try {
    if (isDbConnected()) {
      const history = await JobSearchHistory.find({ userId }).sort({ searchedAt: -1 }).limit(10);
      return res.json({ success: true, history });
    } else {
      // In-memory fallback
      return res.json({ success: true, history: [] });
    }
  } catch (err) {
    console.error('[jobs] Get search history error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch search history' });
  }
}

module.exports = {
  handleJobSearch,
  handleSaveJob,
  handleGetSavedJobs,
  handleGetSearchHistory
};
