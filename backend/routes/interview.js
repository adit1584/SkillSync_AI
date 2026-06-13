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

    const resultMessage = result && result.message ? String(result.message) : '';
    const resultHistory = result && Array.isArray(result.history) ? result.history : history;
    const resultConcluded = !!(result && result.concluded);

    // Conclude conditions: AI concludes or history reaches 10 entries (5 exchanges)
    const isAiConcluded = resultConcluded || 
                          resultMessage.toLowerCase().includes('conclude') || 
                          resultMessage.toLowerCase().includes('thank you for your time');
    const isLengthConcluded = resultHistory.length >= 10;
    const shouldConclude = isAiConcluded || isLengthConcluded;

    let scorecard = null;
    let interviewScore = null;
    let careerReadinessScore = null;

    if (shouldConclude) {
      scorecard = await evaluateInterview(resultHistory, targetRole);

      // Compute composite interview score
      interviewScore = Math.round(
        ((scorecard.overall_score || 0) + (scorecard.technical_depth_score || 0) + (scorecard.communication_score || 0)) / 3
      );

      // Career Readiness Score: 40% skill match + 30% quiz + 30% interview
      const skillMatchScore = user.gap_analysis?.match_score || 0;
      const quizScore = user.quiz_score || 0;
      careerReadinessScore = Math.round(
        0.4 * skillMatchScore + 0.3 * quizScore + 0.3 * interviewScore
      );
    }

    const sessionUpdates = {
      'interview.history': resultHistory,
      'interview.concluded': shouldConclude,
      'interview.scorecard': scorecard,
    };

    if (shouldConclude) {
      sessionUpdates['interview_score'] = interviewScore;
      sessionUpdates['career_readiness_score'] = careerReadinessScore;
    }

    await updateSession(session_id, sessionUpdates);

    res.json({
      success: true,
      message: resultMessage,
      history: resultHistory,
      concluded: shouldConclude,
      scorecard,
      interview_score: interviewScore,
      career_readiness_score: careerReadinessScore,
    });
  } catch (err) {
    console.error('[interview/chat] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to chat with interviewer' });
  }
}

module.exports = { handleInterviewStart, handleInterviewChat };
