const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  session_id: { type: String, required: true, index: true },
  quiz_id: String,
  target_role: String,
  experience_level: String,
  per_skill_scores: [
    {
      skill: String,
      score: Number,        // 0-100
      correct: Number,
      total: Number,
      proficiency: String   // Expert | Proficient | Beginner | Needs Work
    }
  ],
  overall_score: Number,  // 0-100
  time_taken_seconds: Number,
  submitted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
