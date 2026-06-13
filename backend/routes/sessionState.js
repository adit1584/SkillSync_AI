const { verifyToken } = require('../middleware/authMiddleware');
const SessionState = require('../models/SessionState');
const Resume = require('../models/Resume');
const { isDbConnected } = require('../services/dbHelper');
const sessionStore = require('../services/sessionStore');

// In-memory fallback session states by user ID
const memorySessionStates = {};

/**
 * Handle GET /api/session/state
 */
async function handleGetState(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return; // Response sent by verifyToken

  try {
    let state = null;
    let resume = null;

    if (isDbConnected()) {
      state = await SessionState.findOne({ user_id: userId });
      // Also get the latest resume for this user to automatically reload
      resume = await Resume.findOne({ user_id: userId }).sort({ created_at: -1 });
    } else {
      state = memorySessionStates[userId];
      // In memory store might have resume cached
      const fallbackSession = sessionStore.findOne(userId);
      if (fallbackSession && fallbackSession.resume_data) {
        resume = {
          cloudinary_url: fallbackSession.cloudinary_url || 'local-fallback-url',
          extracted_skills: fallbackSession.resume_data.technical_skills || [],
          extracted_projects: fallbackSession.resume_data.projects || [],
          extracted_experience: fallbackSession.resume_data.experience || [],
          extracted_education: fallbackSession.resume_data.education || [],
          extracted_certifications: fallbackSession.resume_data.certifications || [],
          parsed_text: fallbackSession.parsed_text || ''
        };
      }
    }

    res.json({
      success: true,
      state: state || {
        mode: null,
        selected_role: null,
        custom_role: null,
        job_description: null,
        target_opportunity_option: null,
        quiz_answers: [],
        current_quiz_idx: 0,
        quiz_skipped: false,
        interview_skipped: false,
        interview_history: [],
        interview_concluded: false
      },
      resume: resume || null
    });

  } catch (err) {
    console.error('[sessionState] GetState error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to retrieve session state' });
  }
}

/**
 * Handle POST /api/session/save
 */
async function handleSaveState(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return; // Response sent by verifyToken

  const {
    mode,
    selected_role,
    custom_role,
    job_description,
    target_opportunity_option,
    quiz_answers,
    current_quiz_idx,
    quiz_skipped,
    interview_skipped,
    interview_history,
    interview_concluded
  } = req.body;

  try {
    const updates = {
      mode,
      selected_role,
      custom_role,
      job_description,
      target_opportunity_option,
      quiz_answers,
      current_quiz_idx,
      quiz_skipped,
      interview_skipped,
      interview_history,
      interview_concluded,
      last_saved: new Date()
    };

    let savedState;
    if (isDbConnected()) {
      savedState = await SessionState.findOneAndUpdate(
        { user_id: userId },
        { $set: updates },
        { new: true, upsert: true }
      );
    } else {
      if (!memorySessionStates[userId]) {
        memorySessionStates[userId] = { user_id: userId };
      }
      Object.assign(memorySessionStates[userId], updates);
      savedState = memorySessionStates[userId];
    }

    res.json({
      success: true,
      state: savedState
    });

  } catch (err) {
    console.error('[sessionState] SaveState error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to save session state' });
  }
}

module.exports = {
  handleGetState,
  handleSaveState
};
