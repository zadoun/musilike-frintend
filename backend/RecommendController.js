const Recommendation = require('./models/Recommendation');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// GET /api/users - List users (for recommendation selection)
const listUsers = async (req, res) => {
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
const sendRecommendation = async (req, res) => {
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
    // Emit socket event to recipient if connected
    try {
      const { io, userSocketMap } = require('./index');
      if (userSocketMap[toUserId]) {
        io.to(userSocketMap[toUserId]).emit('new-recommendation', {
          recommendationId: rec._id,
          fromUser: fromUser.username || fromUser.email,
          message,
          track
        });
        console.log('Emitted new-recommendation to', toUserId);
      } else {
        console.log('No socket found for recipient:', toUserId);
      }
    } catch (e) {
      console.log('Socket emit error:', e);
    }
    res.status(201).json({ message: 'Recommendation sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Could not send recommendation.' });
  }
};

// POST /api/recommendation/:id/react - React to a recommendation (recipient only)
const reactToRecommendation = async (req, res) => {
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
  const { id } = req.params;
  const { emoji, text } = req.body;
  if (!emoji && !text) return res.status(400).json({ error: 'No reaction provided.' });
  try {
    const rec = await Recommendation.findById(id);
    if (!rec) return res.status(404).json({ error: 'Recommendation not found.' });
    if (String(rec.toUser) !== String(user._id)) {
      return res.status(403).json({ error: 'Only the recipient can react.' });
    }
    rec.reaction = {
      emoji: emoji || '',
      text: text || '',
      reactedAt: new Date()
    };
    await rec.save();

    // Ensure fromUser is populated
    let senderId;
    try {
      if (!rec.fromUser.username && rec.populate) {
        await rec.populate('fromUser', 'username email');
      }
      senderId = rec.fromUser?._id?.toString() || rec.fromUser?.toString();
    } catch (e) {
      console.log('Error populating fromUser:', e);
    }

    // Notify sender in real-time if connected
    try {
      const { io, userSocketMap } = require('./index');
      console.log('Attempting to notify sender:', senderId, 'userSocketMap:', userSocketMap);
      if (senderId && userSocketMap[senderId]) {
        io.to(userSocketMap[senderId]).emit('recommendation-reacted', {
          recommendationId: rec._id,
          reaction: rec.reaction
        });
        console.log('Emitted recommendation-reacted to', senderId);
      } else {
        console.log('No socket found for sender:', senderId);
      }
    } catch (e) {
      console.log('Socket emit error:', e);
    }

    res.json({ success: true, reaction: rec.reaction });
  } catch (err) {
    res.status(500).json({ error: 'Could not save reaction.' });
   }
};

// GET /api/inbox - Get recommendations sent to the logged-in user
const getInbox = async (req, res) => {
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

// GET /api/recommendations/sent - Recommendations sent by the logged-in user
const getSentRecommendations = async (req, res) => {
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
    const sent = await Recommendation.find({ fromUser: user._id }).populate('toUser', 'username email');
    res.json({ sent });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch sent recommendations.' });
  }
};

module.exports = {
  listUsers,
  sendRecommendation,
  reactToRecommendation,
  getInbox,
  getSentRecommendations
};
