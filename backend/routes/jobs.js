const { verifyToken } = require('../middleware/authMiddleware');
const { getSession, updateSession, isDbConnected } = require('../services/dbHelper');
const { rateLimiter } = require('../middleware/rateLimitMiddleware');
const SavedJob = require('../models/SavedJob');
const JobSearchHistory = require('../models/JobSearchHistory');

// Cache for live jobs from APIs
let cachedJobs = null;
let lastFetchedTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

async function fetchAllRealJobs() {
  if (cachedJobs && (Date.now() - lastFetchedTime < CACHE_DURATION)) {
    return cachedJobs;
  }

  const mergedJobs = [];

  const urls = [
    { source: 'Arbeitnow', url: 'https://www.arbeitnow.com/api/job-board-api' },
    { source: 'Remotive', url: 'https://remotive.com/api/remote-jobs' }
  ];

  const results = await Promise.allSettled(
    urls.map(item => fetch(item.url).then(async res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    }))
  );

  // Parse Arbeitnow
  if (results[0].status === 'fulfilled') {
    const data = results[0].value;
    const items = data.data || [];
    items.forEach((job, idx) => {
      const tags = Array.isArray(job.tags) ? job.tags : [];
      mergedJobs.push({
        jobId: `real_arbeitnow_${job.slug || idx}`,
        title: job.title || 'Technical Specialist',
        company: job.company_name || 'Innovations Corp',
        location: job.location || 'Remote',
        workType: job.remote ? 'Remote' : (job.job_types?.includes('Hybrid') ? 'Hybrid' : 'Onsite'),
        experienceRequired: '2-5 years',
        salary: 'Not specified',
        postedDate: 'Recently',
        requiredSkills: tags.length > 0 ? tags : ['Git', 'APIs', 'Problem Solving'],
        applicationSource: `Arbeitnow (${job.company_name})`,
        url: job.url || 'https://www.arbeitnow.com',
        description: job.description || ''
      });
    });
  } else {
    console.warn('[jobs] Failed to fetch Arbeitnow jobs:', results[0].reason?.message || results[0].reason);
  }

  // Parse Remotive
  if (results[1].status === 'fulfilled') {
    const data = results[1].value;
    const items = data.jobs || [];
    items.forEach((job, idx) => {
      const tags = Array.isArray(job.tags) ? job.tags : [];
      let postedDate = 'Recently';
      if (job.publication_date) {
        try {
          const pubDate = new Date(job.publication_date);
          const diffTime = Math.abs(new Date() - pubDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 0) postedDate = 'Today';
          else if (diffDays === 1) postedDate = '1 day ago';
          else postedDate = `${diffDays} days ago`;
        } catch (e) {
          postedDate = 'Recently';
        }
      }

      mergedJobs.push({
        jobId: `real_remotive_${job.id || idx}`,
        title: job.title || 'Technical Specialist',
        company: job.company_name || 'Innovations Corp',
        location: job.candidate_required_location || 'Remote',
        workType: 'Remote',
        experienceRequired: '2-5 years',
        salary: job.salary || 'Not specified',
        postedDate,
        requiredSkills: tags.length > 0 ? tags : ['Git', 'APIs', 'Problem Solving'],
        applicationSource: `Remotive (${job.company_name})`,
        url: job.url || 'https://remotive.com',
        description: job.description || ''
      });
    });
  } else {
    console.warn('[jobs] Failed to fetch Remotive jobs:', results[1].reason?.message || results[1].reason);
  }

  if (mergedJobs.length > 0) {
    cachedJobs = mergedJobs;
    lastFetchedTime = Date.now();
  } else if (cachedJobs) {
    return cachedJobs;
  }

  return mergedJobs;
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

    // 1. Gather all real jobs from APIs (with cache support)
    const apiJobs = await fetchAllRealJobs();
    let filteredJobs = [...apiJobs];

    // 2. Local Keyword relevance scoring and filtering
    const targetRoleLower = targetRole.trim().toLowerCase();
    const roleTokens = targetRoleLower.split(/\s+/).filter(t => t.length > 2);

    if (targetRoleLower && roleTokens.length > 0) {
      filteredJobs = filteredJobs.filter(job => {
        let relevanceScore = 0;
        const jobTitleLower = job.title.toLowerCase();
        const jobCompLower = job.company.toLowerCase();
        const jobSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
        const jobDescLower = job.description.toLowerCase();

        // Exact match on title boost
        if (jobTitleLower.includes(targetRoleLower)) {
          relevanceScore += 50;
        }

        roleTokens.forEach(token => {
          if (jobTitleLower.includes(token)) {
            relevanceScore += 25;
          }
          if (jobSkillsLower.includes(token)) {
            relevanceScore += 15;
          }
          if (jobDescLower.includes(token)) {
            relevanceScore += 10;
          }
          if (jobCompLower.includes(token)) {
            relevanceScore += 5;
          }
        });

        job.relevanceScore = relevanceScore;
        return relevanceScore > 0;
      });
    } else {
      filteredJobs.forEach(job => {
        job.relevanceScore = 0;
      });
    }

    // 3. Filter by location if specified
    if (location && location.trim().toLowerCase() !== 'remote' && location.trim() !== '') {
      const normLocation = location.trim().toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(normLocation) || 
        normLocation.includes(job.location.toLowerCase())
      );
    }

    // 4. Filter by workplace setting if specified
    if (remote || hybrid || onsite) {
      filteredJobs = filteredJobs.filter(job => {
        if (remote && job.workType === 'Remote') return true;
        if (hybrid && job.workType === 'Hybrid') return true;
        if (onsite && job.workType === 'Onsite') return true;
        return false;
      });
    }

    // 5. Filter by user-defined skills if specified
    if (skills) {
      const filterSkills = String(skills).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (filterSkills.length > 0) {
        filteredJobs = filteredJobs.filter(job => {
          const jobSkillsLower = job.requiredSkills.map(s => s.toLowerCase());
          const jobDescLower = job.description.toLowerCase();
          return filterSkills.some(fs => jobSkillsLower.includes(fs) || jobDescLower.includes(fs));
        });
      }
    }

    // 6. Compute matching details for resume extension comparison
    filteredJobs.forEach(job => {
      const matchingSkills = job.requiredSkills.filter(s => resumeSkills.includes(s.toLowerCase()));
      const missingSkills = job.requiredSkills.filter(s => !resumeSkills.includes(s.toLowerCase()));
      
      const strengths = [];
      const improvements = [];
      
      if (matchingSkills.length > 0) {
        strengths.push(`Matches core skills: ${matchingSkills.slice(0, 3).join(', ')}.`);
      } else {
        strengths.push('Matches generic technical engineering foundation.');
      }
      if (missingSkills.length > 0) {
        improvements.push(`Develop capabilities in ${missingSkills.slice(0, 2).join(', ')}.`);
      }
      improvements.push('Incorporate targeted terms to match ATS keyword parameters.');

      job.analysis = {
        matchingSkills,
        missingSkills,
        missingKeywords: missingSkills,
        strengths,
        improvements
      };
    });

    // 7. Sort by relevance and then skill match count
    filteredJobs.sort((a, b) => b.relevanceScore - a.relevanceScore || b.analysis.matchingSkills.length - a.analysis.matchingSkills.length);

    // Slice to top 15 results (could be empty [] if no matches found)
    const finalJobsList = filteredJobs.slice(0, 15);

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
      jobs: finalJobsList.map(job => {
        // Strip temporary helper keys before response
        const { rankingScore, relevanceScore, ...cleanJob } = job;
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
          applicationSource: job.applicationSource,
          url: job.url
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
          url: job.url,
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
