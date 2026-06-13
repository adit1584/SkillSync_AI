const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cloudinary_url: { type: String, required: true },
  public_id: { type: String },
  parsed_text: { type: String },
  extracted_skills: [String],
  extracted_projects: mongoose.Schema.Types.Mixed,
  extracted_experience: mongoose.Schema.Types.Mixed,
  extracted_education: mongoose.Schema.Types.Mixed,
  extracted_certifications: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Resume', resumeSchema);
