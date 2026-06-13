const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, required: true },
  weeks: { type: mongoose.Schema.Types.Mixed },
  priority_skills: [String],
  certifications: [String],
  projects: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
