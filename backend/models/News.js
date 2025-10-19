const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  source: String,
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  timestamp: { type: Date, default: Date.now },
  impactedAssets: [String],
  summary: String,
  tweetUrl: String
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);
