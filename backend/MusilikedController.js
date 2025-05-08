const Musiliked = require('./models/Musiliked');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Default weight configuration for compatibility scoring
const COMPATIBILITY_WEIGHTS = {
  track: 0.4,   // Importance of shared tracks
  artist: 0.3,  // Importance of shared artists
  genre: 0.3    // Importance of shared genres
};

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
    const tracks = await Musiliked.find({ user: user._id })
      .populate('fromUser', 'username')
      .populate('recommendation');
    res.json({ tracks });
  } catch (err) {
    console.error('GET /api/musiliked error:', err);
    res.status(500).json({ error: 'Could not fetch Musi-Liked tracks.' });
  }
}

// GET /api/musiliked/user/:userId - Get all Musi-Liked tracks for any user (public)
exports.getMusilikedForUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing userId param' });
  try {
    const tracks = await Musiliked.find({ user: userId })
      .populate('fromUser', 'username')
      .populate('recommendation');
    res.json({ tracks });
  } catch (err) {
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
      recommendation: req.body.recommendationId || undefined,
      fromUser: req.body.fromUserId || undefined,
    });
    await musiliked.save();
    res.status(201).json({ message: 'Track Musi-Liked!', musiliked });
  } catch (err) {
    res.status(500).json({ error: 'Could not Musi-Like track.' });
  }
};



// GET /api/musiliked/recommend?userA=xxx&userB=yyy - Recommend tracks from userB to userA based on artist/genre overlap
exports.getRecommendations = async (req, res) => {
  const { userA, userB, limit } = req.query;
  if (!userA || !userB) return res.status(400).json({ error: 'Missing user IDs' });
  const N = limit ? parseInt(limit, 10) : 10;
  try {
    const User = require('./models/User');
    const userAObj = await User.findById(userA);
    const userBObj = await User.findById(userB);
    if (!userAObj || !userBObj) return res.status(404).json({ error: 'User not found' });
    const userAgenres = new Set(Array.isArray(userAObj.musiliked_genres) ? userAObj.musiliked_genres : []);
    // Get all tracks for both users
    const [tracksA, tracksB] = await Promise.all([
      Musiliked.find({ user: userA }),
      Musiliked.find({ user: userB })
    ]);
    const userAartists = new Set(tracksA.flatMap(t => t.artists || []));
    const userAtrackIds = new Set(tracksA.map(t => t.trackId));
    // Candidate tracks: liked by userB, not by userA
    const candidateTracks = tracksB.filter(t => !userAtrackIds.has(t.trackId));
    // Score by genre/artist overlap
    const scored = candidateTracks.map(track => {
      const genreScore = (track.genres || []).filter(g => userAgenres.has(g)).length;
      const artistScore = (track.artists || []).filter(a => userAartists.has(a)).length;
      return { track, score: genreScore + artistScore };
    });
    scored.sort((a, b) => b.score - a.score);
    res.json({
      recommendations: scored.slice(0, N).map(s => ({ ...s.track.toObject(), score: s.score })),
      total: scored.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not generate recommendations.' });
  }
};

// GET /api/musiliked/recommend-reverse?userA=xxx&userB=yyy - Recommend tracks from userA to userB based on artist/genre overlap
exports.getReverseRecommendations = async (req, res) => {
  const { userA, userB, limit } = req.query;
  if (!userA || !userB) return res.status(400).json({ error: 'Missing user IDs' });
  const N = limit ? parseInt(limit, 10) : 10;
  try {
    const User = require('./models/User');
    const userAObj = await User.findById(userA);
    const userBObj = await User.findById(userB);
    if (!userAObj || !userBObj) return res.status(404).json({ error: 'User not found' });
    const userBgenres = new Set(Array.isArray(userBObj.musiliked_genres) ? userBObj.musiliked_genres : []);
    // Get all tracks for both users
    const [tracksA, tracksB] = await Promise.all([
      Musiliked.find({ user: userA }),
      Musiliked.find({ user: userB })
    ]);
    const userBartists = new Set(tracksB.flatMap(t => t.artists || []));
    const userBtrackIds = new Set(tracksB.map(t => t.trackId));
    // Candidate tracks: liked by userA, not by userB
    const candidateTracks = tracksA.filter(t => !userBtrackIds.has(t.trackId));
    // Score by genre/artist overlap
    const scored = candidateTracks.map(track => {
      const genreScore = (track.genres || []).filter(g => userBgenres.has(g)).length;
      const artistScore = (track.artists || []).filter(a => userBartists.has(a)).length;
      return { track, score: genreScore + artistScore };
    });
    scored.sort((a, b) => b.score - a.score);
    res.json({
      recommendations: scored.slice(0, N).map(s => ({ ...s.track.toObject(), score: s.score })),
      total: scored.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not generate reverse recommendations.' });
  }
};

// Compatibility endpoint
exports.getCompatibility = async (req, res) => {
  const { userA, userB } = req.query;
  if (!userA || !userB) return res.status(400).json({ error: 'Missing user IDs' });
  // Allow weights via query params, fallback to defaults
  const trackWeight = req.query.trackWeight !== undefined ? parseFloat(req.query.trackWeight) : COMPATIBILITY_WEIGHTS.track;
  const artistWeight = req.query.artistWeight !== undefined ? parseFloat(req.query.artistWeight) : COMPATIBILITY_WEIGHTS.artist;
  const genreWeight = req.query.genreWeight !== undefined ? parseFloat(req.query.genreWeight) : COMPATIBILITY_WEIGHTS.genre;
  const totalWeight = trackWeight + artistWeight + genreWeight;
  // Normalize if needed
  const normTrackWeight = trackWeight / totalWeight;
  const normArtistWeight = artistWeight / totalWeight;
  const normGenreWeight = genreWeight / totalWeight;

  try {
    // Get all musiliked tracks for both users
    const [tracksA, tracksB] = await Promise.all([
      Musiliked.find({ user: userA }),
      Musiliked.find({ user: userB })
    ]);
    // Track ID overlap
    const idsA = new Set(tracksA.map(t => t.trackId));
    const idsB = new Set(tracksB.map(t => t.trackId));
    const sharedTrackIds = [...idsA].filter(id => idsB.has(id));
    const sharedTracks = tracksA.filter(t => sharedTrackIds.includes(t.trackId));
    // Artist overlap
    const artistsA = new Set(tracksA.flatMap(t => t.artists || []));
    const artistsB = new Set(tracksB.flatMap(t => t.artists || []));
    const sharedArtists = [...artistsA].filter(artist => artistsB.has(artist));
    // Genre overlap (from user.musiliked_genres)
    const User = require('./models/User');
    const userAObj = await User.findById(userA);
    const userBObj = await User.findById(userB);
    const genresA = new Set(Array.isArray(userAObj?.musiliked_genres) ? userAObj.musiliked_genres : []);
    const genresB = new Set(Array.isArray(userBObj?.musiliked_genres) ? userBObj.musiliked_genres : []);
    const sharedGenres = [...genresA].filter(genre => genresB.has(genre));
    // Compatibility scores
    const trackScore = sharedTrackIds.length / (new Set([...idsA, ...idsB]).size || 1);
    const artistScore = sharedArtists.length / (new Set([...artistsA, ...artistsB]).size || 1);
    const genreScore = sharedGenres.length / (new Set([...genresA, ...genresB]).size || 1);
    const weightedScore = (trackScore * normTrackWeight) + (artistScore * normArtistWeight) + (genreScore * normGenreWeight);
    res.json({
      sharedTrackIds,
      sharedTracks,
      sharedArtists,
      sharedGenres,
      scores: {
        trackScore,
        artistScore,
        genreScore,
        weightedScore,
        weights: {
          track: normTrackWeight,
          artist: normArtistWeight,
          genre: normGenreWeight
        }
      },
      count: {
        sharedTracks: sharedTrackIds.length,
        sharedArtists: sharedArtists.length,
        sharedGenres: sharedGenres.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not calculate compatibility.' });
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
