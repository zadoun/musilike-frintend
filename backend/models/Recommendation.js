const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  track: { type: Object, required: true }, // Store full track info
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  reaction: {
    emoji: { type: String, default: '' },
    text: { type: String, default: '' },
    reactedAt: { type: Date }
  }
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
