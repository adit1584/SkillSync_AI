const mongoose = require('mongoose');

const jobSearchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  query: { type: String },
  filters: { type: mongoose.Schema.Types.Mixed },
  searchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobSearchHistory', jobSearchHistorySchema);
