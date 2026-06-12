/**
 * In-Memory Session Store with Local File Persistence
 * Fallback when MongoDB is unavailable. Saves to data/sessions.json
 * so sessions survive nodemon auto-restarts during development.
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'data', 'sessions.json');

// Ensure data folder exists
const dir = path.dirname(FILE_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// In-Memory map synced to file
let store = new Map();

// Helper to load sessions from file
function loadSessions() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const dataText = fs.readFileSync(FILE_PATH, 'utf-8');
      if (dataText.trim()) {
        const obj = JSON.parse(dataText);
        store = new Map(Object.entries(obj));
        console.log(`[sessionStore] Loaded ${store.size} sessions from disk.`);
      }
    }
  } catch (err) {
    console.warn('[sessionStore] Error loading sessions from file:', err.message);
  }
}

// Helper to save sessions to file
function saveSessions() {
  try {
    const obj = Object.fromEntries(store);
    fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[sessionStore] Error saving sessions to file:', err.message);
  }
}

// Load on startup
loadSessions();

const sessionStore = {
  create(sessionId, data) {
    const doc = { session_id: sessionId, ...data, created_at: new Date() };
    store.set(sessionId, doc);
    saveSessions();
    return doc;
  },

  findOne(sessionId) {
    return store.get(sessionId) || null;
  },

  update(sessionId, updates) {
    const existing = store.get(sessionId);
    if (!existing) return null;

    // Handle dot-notation keys like 'quiz_result.questions'
    const merged = { ...existing };
    for (const [key, value] of Object.entries(updates)) {
      if (key.includes('.')) {
        const parts = key.split('.');
        if (!merged[parts[0]]) merged[parts[0]] = {};
        merged[parts[0]][parts[1]] = value;
      } else {
        merged[key] = value;
      }
    }
    store.set(sessionId, merged);
    saveSessions();
    return merged;
  },

  size() {
    return store.size;
  }
};

module.exports = sessionStore;
