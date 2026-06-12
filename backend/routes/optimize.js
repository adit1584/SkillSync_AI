const { generateOptimizeSuggestions } = require('../services/aiService');
const { getSession, updateSession } = require('../services/dbHelper');

/**
 * Handle POST /api/optimize
 */
async function handleResumeOptimize(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    // Try to return cached suggestions if they already exist
    if (user.resume_optimization?.suggestions?.length > 0) {
      return res.json({
        success: true,
        suggestions: user.resume_optimization.suggestions
      });
    }

    const targetRole = user.target_role;
    const missingSkills = user.gap_analysis?.missing_skills || [];
    const currentResumeData = user.resume_data || {};

    if (missingSkills.length === 0) {
      return res.json({
        success: true,
        suggestions: [],
        message: 'Your resume already matches all required technical skills for this role!'
      });
    }

    const result = await generateOptimizeSuggestions(targetRole, missingSkills, currentResumeData);

    await updateSession(session_id, {
      'resume_optimization.suggestions': result.suggestions
    });

    res.json({
      success: true,
      suggestions: result.suggestions || []
    });
  } catch (err) {
    console.error('[optimize] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to optimize resume' });
  }
}

module.exports = { handleResumeOptimize };
