const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rank: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  portfolioValue: { type: Number, default: 0 },
  securityScore: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
