const { generateCourseRecommendations } = require('../services/aiService');
const { getSkillHash, getCoursesCached } = require('../services/cacheManager');
const { getSession, updateSession } = require('../services/dbHelper');

/**
 * Normalizes course URLs dynamically based on the platform and skill
 */
function normalizeCourseUrls(recs) {
  if (!Array.isArray(recs)) return [];
  return recs.map(rec => {
    const platform = (rec.platform || '').toLowerCase();
    const query = rec.course_title || rec.skill;
    let url = rec.url;

    if (platform.includes('coursera')) {
      url = `https://www.coursera.org/search?query=${encodeURIComponent(query)}`;
    } else if (platform.includes('udemy')) {
      url = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`;
    } else if (platform.includes('youtube')) {
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' course')}`;
    } else if (platform.includes('edx')) {
      url = `https://www.edx.org/search?q=${encodeURIComponent(query)}`;
    } else if (platform.includes('mdn') || platform.includes('doc')) {
      url = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(rec.skill)}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + (rec.platform || '') + ' course')}`;
    }

    return { ...rec, url };
  });
}

/**
 * Handle POST /api/courses
 */
async function handleCourses(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    // Check cache first (0 tokens)
    if (user.courses && Array.isArray(user.courses.recommendations)) {
      console.log(`[courses] Returning cached course recommendations for session ${session_id}`);
      return res.json({
        success: true,
        from_cache: true,
        courses: user.courses.recommendations
      });
    }

    const gapAnalysis = user.gap_analysis || {};
    const quizScores = user.quiz_result?.per_skill_scores || [];

    const gapSkills = gapAnalysis.missing_skills || [];
    const weakSkills = quizScores
      .filter(s => s.score < 60)
      .map(s => s.skill);

    // If there are no missing or weak skills, target the matched skills for advanced courses
    let targetSkillsForRecommender = [...gapSkills, ...weakSkills];
    if (targetSkillsForRecommender.length === 0) {
      targetSkillsForRecommender = gapAnalysis.matched_skills || [];
    }

    const skillHash = getSkillHash(targetSkillsForRecommender, user.target_role + '_courses');

    const { courses, fromCache } = await getCoursesCached(
      skillHash,
      () => generateCourseRecommendations(user.target_role, gapSkills, weakSkills)
    );

    const normalizedRecs = normalizeCourseUrls(courses.recommendations || []);

    await updateSession(session_id, { 
      courses: { ...courses, recommendations: normalizedRecs } 
    });

    res.json({
      success: true,
      from_cache: fromCache,
      courses: normalizedRecs
    });

  } catch (err) {
    console.error('[courses] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate course recommendations' });
  }
}

module.exports = { handleCourses };
