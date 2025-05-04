const HiddenRecommendation = require('./models/HiddenRecommendation');
const Recommendation = require('./models/Recommendation');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// POST /api/hidden-recommendation - Hide a recommendation for the logged-in user
exports.hideRecommendation = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  const token = auth.split(' ')[1];
  let user;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
  const { recommendationId } = req.body;
  if (!recommendationId) return res.status(400).json({ error: 'Missing recommendationId.' });
  try {
    // Prevent duplicates
    const exists = await HiddenRecommendation.findOne({ user: user._id, recommendation: recommendationId });
    if (exists) return res.status(200).json({ message: 'Already hidden.' });
    await HiddenRecommendation.create({ user: user._id, recommendation: recommendationId });
    res.status(201).json({ message: 'Recommendation hidden.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not hide recommendation.' });
  }
};

// GET /api/hidden-recommendation - Get IDs of hidden recommendations for the logged-in user
exports.listHiddenRecommendations = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  const token = auth.split(' ')[1];
  let user;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
  try {
    const hidden = await HiddenRecommendation.find({ user: user._id }).select('recommendation');
    res.json({ hiddenIds: hidden.map(h => h.recommendation.toString()) });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch hidden recommendations.' });
  }
};
