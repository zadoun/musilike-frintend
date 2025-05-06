const Musiliked = require('./models/Musiliked');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// GET /api/musiliked - Get all Musi-Liked tracks for the logged-in user
exports.getMusiliked = async (req, res) => {
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
    const tracks = await Musiliked.find({ user: user._id });
    res.json({ tracks });
  } catch (err) {
    console.error('GET /api/musiliked error:', err);
    res.status(500).json({ error: 'Could not fetch Musi-Liked tracks.' });
  }
};

// POST /api/musiliked - Add a Musi-Liked track for the logged-in user
exports.addMusiliked = async (req, res) => {
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
  const { trackId, trackName, artists, albumName, albumImage, spotifyUrl, rawTrack } = req.body;
  if (!trackId) return res.status(400).json({ error: 'Missing trackId' });
  try {
    // Prevent duplicate musiliked for same user/track
    const exists = await Musiliked.findOne({ user: user._id, trackId });
    if (exists) return res.status(409).json({ error: 'Track already Musi-Liked.' });
    const musiliked = new Musiliked({
      user: user._id,
      trackId,
      trackName,
      artists,
      albumName,
      albumImage,
      spotifyUrl,
      rawTrack,
    });
    await musiliked.save();
    res.status(201).json({ message: 'Track Musi-Liked!', musiliked });
  } catch (err) {
    res.status(500).json({ error: 'Could not Musi-Like track.' });
  }
};

// DELETE /api/musiliked/:trackId - Remove a Musi-Liked track for the logged-in user
exports.deleteMusiliked = async (req, res) => {
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
  const { trackId } = req.params;
  if (!trackId) return res.status(400).json({ error: 'Missing trackId param' });
  try {
    const result = await Musiliked.findOneAndDelete({ user: user._id, trackId });
    if (!result) return res.status(404).json({ error: 'Track not found in Musi-Liked.' });
    res.json({ message: 'Track unliked.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not unlike track.' });
  }
};
