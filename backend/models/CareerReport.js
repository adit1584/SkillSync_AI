const mongoose = require('mongoose');

const careerReportSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  gap_analysis: { type: mongoose.Schema.Types.Mixed },
  simulations: { type: mongoose.Schema.Types.Mixed },
  readiness_score: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('CareerReport', careerReportSchema);
