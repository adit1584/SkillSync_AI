const mongoose = require('mongoose');

const roleSelectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  selectedRole: { type: String, required: true },
  customRole: { type: String },
  selectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoleSelection', roleSelectionSchema);
