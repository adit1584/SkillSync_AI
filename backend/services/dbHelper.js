const mongoose = require('mongoose');
const sessionStore = require('./sessionStore');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

/**
 * Returns true if MongoDB is currently connected
 */
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Save a new user session — tries MongoDB, falls back to in-memory store
 */
async function createSession(sessionId, data) {
  if (isDbConnected()) {
    try {
      return await User.create({ session_id: sessionId, ...data });
    } catch (err) {
      console.warn('[db] MongoDB create failed, using in-memory store:', err.message);
    }
  }
  return sessionStore.create(sessionId, data);
}

/**
 * Get a session by ID — tries MongoDB, falls back to in-memory store
 */
async function getSession(sessionId) {
  if (isDbConnected()) {
    try {
      const doc = await User.findOne({ session_id: sessionId });
      if (doc) return doc;
    } catch (err) {
      console.warn('[db] MongoDB findOne failed, trying in-memory store:', err.message);
    }
  }
  return sessionStore.findOne(sessionId);
}

/**
 * Update a session by ID — tries MongoDB, falls back to in-memory store
 */
async function updateSession(sessionId, updates) {
  if (isDbConnected()) {
    try {
      const result = await User.findOneAndUpdate(
        { session_id: sessionId },
        updates,
        { new: true }
      );
      if (result) return result;
    } catch (err) {
      console.warn('[db] MongoDB update failed, using in-memory store:', err.message);
    }
  }
  return sessionStore.update(sessionId, updates);
}

/**
 * Save quiz result — tries MongoDB, ignores failure (not critical)
 */
async function saveQuizResult(data) {
  if (isDbConnected()) {
    try {
      return await QuizResult.create(data);
    } catch (err) {
      console.warn('[db] QuizResult save failed (non-critical):', err.message);
    }
  }
  // In-memory fallback: store in session
  return null;
}

module.exports = { createSession, getSession, updateSession, saveQuizResult, isDbConnected };
