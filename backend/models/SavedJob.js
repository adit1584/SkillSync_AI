const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobId: { type: String, required: true, index: true },
  title: { type: String },
  company: { type: String },
  location: { type: String },
  workType: { type: String },
  experienceRequired: { type: String },
  salary: { type: String },
  postedDate: { type: String },
  requiredSkills: [String],
  applicationSource: { type: String },
  url: { type: String },
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedJob', savedJobSchema);
