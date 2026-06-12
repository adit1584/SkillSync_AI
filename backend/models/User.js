const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  session_id: { type: String, required: true, unique: true, index: true },
  resume_data: {
    name: String,
    email: String,
    phone: String,
    experience_level: String,
    technical_skills: [String],
    soft_skills: [String],
    tools_and_frameworks: [String],
    projects: mongoose.Schema.Types.Mixed,
    certifications: [String],
    domains: [String],
    education: mongoose.Schema.Types.Mixed,
    experience: mongoose.Schema.Types.Mixed,
  },
  target_role: String,
  gap_analysis: mongoose.Schema.Types.Mixed,
  quiz_result: mongoose.Schema.Types.Mixed,
  career_simulation: mongoose.Schema.Types.Mixed,
  roadmap: mongoose.Schema.Types.Mixed,
  courses: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('User', userSchema);
