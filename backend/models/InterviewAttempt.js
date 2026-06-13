const mongoose = require('mongoose');

const interviewAttemptSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  chat_history: { type: mongoose.Schema.Types.Mixed },
  scorecard: { type: mongoose.Schema.Types.Mixed },
  completed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('InterviewAttempt', interviewAttemptSchema);
