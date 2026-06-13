const mongoose = require('mongoose');

const sessionStateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  mode: { type: String, enum: ['path_a', 'path_b', null], default: null },
  selected_role: { type: String, default: null },
  quiz_answers: { type: mongoose.Schema.Types.Mixed, default: [] },
  current_quiz_idx: { type: Number, default: 0 },
  quiz_skipped: { type: Boolean, default: false },
  interview_skipped: { type: Boolean, default: false },
  interview_history: { type: mongoose.Schema.Types.Mixed, default: [] },
  interview_concluded: { type: Boolean, default: false },
  last_saved: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('SessionState', sessionStateSchema);
