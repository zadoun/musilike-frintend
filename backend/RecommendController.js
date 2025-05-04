const Recommendation = require('./models/Recommendation');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// GET /api/users - List users (for recommendation selection)
exports.listUsers = async (req, res) => {
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
    // Exclude the current user from the list
    const users = await User.find({ _id: { $ne: user._id } }, { password: 0 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users.' });
  }
};

// POST /api/recommend - Send a recommendation
exports.sendRecommendation = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  const token = auth.split(' ')[1];
  let fromUser;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    fromUser = await User.findOne({ email: decoded.email });
    if (!fromUser) return res.status(404).json({ error: 'User not found.' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
  const { toUserId, message, track } = req.body;
  if (!toUserId || !track) return res.status(400).json({ error: 'Missing recipient or track.' });
  try {
    const rec = new Recommendation({
      fromUser: fromUser._id,
      toUser: toUserId,
      message,
      track
    });
    await rec.save();
    res.status(201).json({ message: 'Recommendation sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Could not send recommendation.' });
  }
};

// GET /api/inbox - Get recommendations sent to the logged-in user
exports.getInbox = async (req, res) => {
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
    const inbox = await Recommendation.find({ toUser: user._id }).populate('fromUser', 'username email');
    res.json({ inbox });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch inbox.' });
  }
};
