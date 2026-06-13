const mongoose = require('mongoose');

const roleRecommendationsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roles: [
    {
      role: String,
      match_score: Number,
      confidence_score: Number,
      strengths: [String],
      missing_skills: [String],
      explanation: String
    }
  ],
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('RoleRecommendations', roleRecommendationsSchema);
