const { simulateCareer } = require('../services/aiService');
const { compressGapForSimulation } = require('../services/tokenCompressor');
const { getSession, updateSession } = require('../services/dbHelper');

/**
 * Handle POST /api/simulate
 */
async function handleSimulate(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const resumeData = user.resume_data;
    const gapAnalysis = user.gap_analysis || {};
    const quizScores = user.quiz_result?.per_skill_scores || [];

    const simulationInput = compressGapForSimulation(
      gapAnalysis,
      resumeData,
      quizScores,
      user.target_role
    );

    // AI Prompt 4
    const simulation = await simulateCareer(simulationInput);

    await updateSession(session_id, { career_simulation: simulation });

    res.json({
      success: true,
      simulations: simulation.simulations || [],
    });

  } catch (err) {
    console.error('[simulate] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate career simulation' });
  }
}

module.exports = { handleSimulate };
