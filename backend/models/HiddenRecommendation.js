const mongoose = require('mongoose');

const HiddenRecommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recommendation: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation', required: true },
  hiddenAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HiddenRecommendation', HiddenRecommendationSchema);
