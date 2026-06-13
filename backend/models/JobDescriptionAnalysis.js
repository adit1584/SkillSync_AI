const mongoose = require('mongoose');

const jobDescriptionAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobDescription: { type: String, required: true },
  targetRole: { type: String },
  customRole: { type: String },
  atsScore: { type: Number },
  matchScore: { type: Number },
  missingSkills: [String],
  missingKeywords: [String],
  certificationGap: [String],
  experienceGap: { type: String },
  recommendations: [String],
  strengths: [String],
  improvements: [String],
  analyzedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobDescriptionAnalysis', jobDescriptionAnalysisSchema);
