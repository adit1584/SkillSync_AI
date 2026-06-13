const { recommendCareerRoles } = require('../services/aiService');
const { getSession, updateSession } = require('../services/dbHelper');
const { compressForAI } = require('../services/tokenCompressor');

/**
 * Handle POST /api/recommend
 * Analyzes parsed resume and returns top 5 AI-recommended career roles
 */
async function handleRecommend(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const resumeData = user.resume_data;
    if (!resumeData) return res.status(400).json({ error: 'Resume data not found in session.' });

    // Compress profile for AI (no role needed at this stage)
    const compressedProfile = {
      skills: (resumeData.technical_skills || []).slice(0, 12),
      tools: (resumeData.tools_and_frameworks || []).slice(0, 10),
      soft_skills: (resumeData.soft_skills || []).slice(0, 5),
      level: resumeData.experience_level || 'fresher',
      domains: (resumeData.domains || []).slice(0, 6),
      projects_count: (resumeData.projects || []).length,
      certs_count: (resumeData.certifications || []).length,
      experience_count: (resumeData.experience || []).length,
    };

    console.log('[recommend] Generating career recommendations for session:', session_id);

    // Call AI to recommend roles
    const result = await recommendCareerRoles(compressedProfile);

    // Save recommendations to session
    await updateSession(session_id, {
      recommended_roles: result.recommendations,
    });

    res.json({
      success: true,
      recommendations: result.recommendations,
    });

  } catch (err) {
    console.error('[recommend] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate career recommendations' });
  }
}

module.exports = { handleRecommend };
