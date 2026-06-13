const mongoose = require('mongoose');

const interviewAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  selectedRole: { type: String, required: true },
  attentionScore: { type: Number, required: true },
  focusScore: { type: Number, required: true },
  communicationScore: { type: Number, required: true },
  interviewReadinessScore: { type: Number, required: true },
  eventTimeline: [
    {
      timestamp: { type: String, required: true },
      event: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewAnalytics', interviewAnalyticsSchema);
