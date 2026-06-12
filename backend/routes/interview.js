const { startInterview, chatInterview, evaluateInterview } = require('../services/aiService');
const { getSession, updateSession } = require('../services/dbHelper');

/**
 * Handle POST /api/interview/start
 */
async function handleInterviewStart(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const targetRole = user.target_role;
    const experienceLevel = user.resume_data?.experience_level || 'fresher';
    const skills = [
      ...(user.resume_data?.technical_skills || []),
      ...(user.resume_data?.tools_and_frameworks || [])
    ];

    const result = await startInterview(targetRole, experienceLevel, skills);

    await updateSession(session_id, {
      'interview.history': result.history,
      'interview.concluded': false,
      'interview.scorecard': null
    });

    res.json({
      success: true,
      message: result.message,
      history: result.history,
      concluded: false
    });
  } catch (err) {
    console.error('[interview/start] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to start interview' });
  }
}

/**
 * Handle POST /api/interview/chat
 */
async function handleInterviewChat(req, res) {
  try {
    const { session_id, message } = req.body;
    if (!session_id || !message) {
      return res.status(400).json({ error: 'session_id and message are required' });
    }

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const targetRole = user.target_role;
    const experienceLevel = user.resume_data?.experience_level || 'fresher';
    const history = user.interview?.history || [];

    // Check if already concluded
    if (user.interview?.concluded) {
      return res.json({
        success: true,
        concluded: true,
        scorecard: user.interview?.scorecard,
        message: 'The interview has already concluded.'
      });
    }

    const result = await chatInterview(history, message, targetRole, experienceLevel);

    // Conclude conditions: AI concludes or history reaches 10 entries (5 exchanges)
    const isAiConcluded = !!result.concluded || result.message.toLowerCase().includes('conclude') || result.message.toLowerCase().includes('thank you for your time');
    const isLengthConcluded = result.history.length >= 10;
    const shouldConclude = isAiConcluded || isLengthConcluded;

    let scorecard = null;
    if (shouldConclude) {
      scorecard = await evaluateInterview(result.history, targetRole);
    }

    await updateSession(session_id, {
      'interview.history': result.history,
      'interview.concluded': shouldConclude,
      'interview.scorecard': scorecard
    });

    res.json({
      success: true,
      message: result.message,
      history: result.history,
      concluded: shouldConclude,
      scorecard
    });
  } catch (err) {
    console.error('[interview/chat] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to chat with interviewer' });
  }
}

module.exports = { handleInterviewStart, handleInterviewChat };
