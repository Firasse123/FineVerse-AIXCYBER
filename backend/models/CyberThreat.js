const mongoose = require('mongoose');

const CyberThreatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  threatType: { type: String, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now },
  playerResponse: String,
  impact: String,
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('CyberThreat', CyberThreatSchema);
