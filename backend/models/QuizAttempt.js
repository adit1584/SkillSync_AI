const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  questions: { type: mongoose.Schema.Types.Mixed },
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
