const mongoose = require('mongoose');

const jobScanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  job_description: { type: String, required: true },
  match_score: { type: Number, default: 0 },
  ats_score: { type: Number, default: 0 },
  matching_skills: [String],
  missing_skills: [String],
  missing_keywords: [String],
  suggestions: [String],
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('JobScan', jobScanSchema);
