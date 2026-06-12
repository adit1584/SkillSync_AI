const { generateRoadmap } = require('../services/aiService');
const { getSkillHash, getRoadmapCached } = require('../services/cacheManager');
const { getSession, updateSession } = require('../services/dbHelper');

/**
 * Normalizes roadmap resource URLs dynamically based on platform and resource name
 */
function normalizeRoadmapUrls(roadmap) {
  if (!roadmap || !Array.isArray(roadmap.weeks)) return roadmap;
  
  const weeks = roadmap.weeks.map(week => {
    if (Array.isArray(week.resources)) {
      const resources = week.resources.map(res => {
        const platform = (res.platform || '').toLowerCase();
        const query = res.name || week.focus_skill || '';
        let url = res.url || '';

        if (platform.includes('coursera')) {
          url = `https://www.coursera.org/search?query=${encodeURIComponent(query)}`;
        } else if (platform.includes('udemy')) {
          url = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`;
        } else if (platform.includes('youtube')) {
          url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' course')}`;
        } else if (platform.includes('edx')) {
          url = `https://www.edx.org/search?q=${encodeURIComponent(query)}`;
        } else if (platform.includes('mdn') || platform.includes('doc') || platform.includes('mozilla')) {
          url = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`;
        } else if (platform.includes('khan') || platform.includes('academy')) {
          url = `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(query)}`;
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + (res.platform || '') + ' course')}`;
        }
        return { ...res, url };
      });
      return { ...week, resources };
    }
    return week;
  });
  
  return { ...roadmap, weeks };
}

/**
 * Handle POST /api/roadmap
 */
async function handleRoadmap(req, res) {
  try {
    const { session_id, hours_per_week = 10, target_date } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const gapAnalysis = user.gap_analysis || {};
    const quizScores = user.quiz_result?.per_skill_scores || [];

    const gapSkills = gapAnalysis.missing_skills || [];
    const strongSkills = quizScores
      .filter(s => s.score >= 60)
      .map(s => s.skill);

    const skillHash = getSkillHash(gapSkills, user.target_role);

    const roadmapInput = {
      gap_skills: gapSkills,
      strong_skills: strongSkills,
      target_role: user.target_role,
      hours_per_week,
      target_date: target_date || null,
      hash: skillHash,
    };

    // Try cache first (0 tokens on hit), otherwise call AI
    const { roadmap, fromCache } = await getRoadmapCached(
      skillHash,
      () => generateRoadmap(roadmapInput)
    );

    const normalizedRoadmap = normalizeRoadmapUrls(roadmap);

    await updateSession(session_id, { roadmap: normalizedRoadmap });

    res.json({
      success: true,
      from_cache: fromCache,
      roadmap: normalizedRoadmap,
    });

  } catch (err) {
    console.error('[roadmap] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate roadmap' });
  }
}

module.exports = { handleRoadmap };
