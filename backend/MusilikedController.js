const Musiliked = require('./models/Musiliked');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Flexible weight configuration for compatibility scoring
const COMPATIBILITY_WEIGHTS = {
  track: 0.2,                // Shared track overlap
  trackArtist: 0.2,          // Shared artist in Musi-Liked tracks
  trackGenre: 0.2,           // Shared genre in Musi-Liked tracks
  profileArtist: 0.2,        // Shared artist at profile level
  profileGenre: 0.2          // Shared genre at profile level
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
  const weights = {
    track: req.query.trackWeight !== undefined ? parseFloat(req.query.trackWeight) : COMPATIBILITY_WEIGHTS.track,
    trackArtist: req.query.trackArtistWeight !== undefined ? parseFloat(req.query.trackArtistWeight) : COMPATIBILITY_WEIGHTS.trackArtist,
    trackGenre: req.query.trackGenreWeight !== undefined ? parseFloat(req.query.trackGenreWeight) : COMPATIBILITY_WEIGHTS.trackGenre,
    profileArtist: req.query.profileArtistWeight !== undefined ? parseFloat(req.query.profileArtistWeight) : COMPATIBILITY_WEIGHTS.profileArtist,
    profileGenre: req.query.profileGenreWeight !== undefined ? parseFloat(req.query.profileGenreWeight) : COMPATIBILITY_WEIGHTS.profileGenre,
  };
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  for (const key in weights) weights[key] = weights[key] / totalWeight;

  try {
    const result = await module.exports.calculateCompatibilityFlexible(userA, userB, weights);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Could not calculate compatibility.' });
  }
};

// Flexible compatibility calculation helper (for RecommendController and API)
exports.calculateCompatibilityFlexible = async (userA, userB, weights = COMPATIBILITY_WEIGHTS) => {
  const Musiliked = require('./models/Musiliked');
  const User = require('./models/User');
  // Get all musiliked tracks for both users
  const [tracksA, tracksB] = await Promise.all([
    Musiliked.find({ user: userA }),
    Musiliked.find({ user: userB })
  ]);
  // Track ID overlap
  const idsA = new Set(tracksA.map(t => t.trackId));
  const idsB = new Set(tracksB.map(t => t.trackId));
  const sharedTrackIds = [...idsA].filter(id => idsB.has(id));
  // Get full track objects for shared tracks (from userA's tracks for consistency)
  const sharedTracks = tracksA.filter(t => sharedTrackIds.includes(t.trackId));
  // Track-level artists and genres
  const trackArtistsA = new Set(tracksA.flatMap(t => t.artists || []));
  const trackArtistsB = new Set(tracksB.flatMap(t => t.artists || []));
  const sharedTrackArtists = [...trackArtistsA].filter(a => trackArtistsB.has(a));
  // For genres, if tracks have a genres field, otherwise fallback to []
  const trackGenresA = new Set(tracksA.flatMap(t => t.genres || []));
  const trackGenresB = new Set(tracksB.flatMap(t => t.genres || []));
  const sharedTrackGenres = [...trackGenresA].filter(g => trackGenresB.has(g));
  // Profile-level artists and genres
  const userAObj = await User.findById(userA);
  const userBObj = await User.findById(userB);
  const profileArtistsA = new Set(Array.isArray(userAObj?.musiliked_artistes) ? userAObj.musiliked_artistes : []);
  const profileArtistsB = new Set(Array.isArray(userBObj?.musiliked_artistes) ? userBObj.musiliked_artistes : []);
  const sharedProfileArtists = [...profileArtistsA].filter(a => profileArtistsB.has(a));
  const profileGenresA = new Set(Array.isArray(userAObj?.musiliked_genres) ? userAObj.musiliked_genres : []);
  const profileGenresB = new Set(Array.isArray(userBObj?.musiliked_genres) ? userBObj.musiliked_genres : []);
  const sharedProfileGenres = [...profileGenresA].filter(g => profileGenresB.has(g));
  // Normalized scores
  const trackScore = sharedTrackIds.length / (new Set([...idsA, ...idsB]).size || 1);
  const trackArtistScore = sharedTrackArtists.length / (new Set([...trackArtistsA, ...trackArtistsB]).size || 1);
  const trackGenreScore = sharedTrackGenres.length / (new Set([...trackGenresA, ...trackGenresB]).size || 1);
  const profileArtistScore = sharedProfileArtists.length / (new Set([...profileArtistsA, ...profileArtistsB]).size || 1);
  const profileGenreScore = sharedProfileGenres.length / (new Set([...profileGenresA, ...profileGenresB]).size || 1);
  // Weighted sum
  const weightedScore =
    (trackScore * weights.track) +
    (trackArtistScore * weights.trackArtist) +
    (trackGenreScore * weights.trackGenre) +
    (profileArtistScore * weights.profileArtist) +
    (profileGenreScore * weights.profileGenre);
  return {
    sharedTrackIds,
    sharedTracks, // <-- full track objects
    sharedTrackArtists,
    sharedTrackGenres,
    sharedProfileArtists,
    sharedProfileGenres,
    scores: {
      trackScore,
      trackArtistScore,
      trackGenreScore,
      profileArtistScore,
      profileGenreScore,
      weightedScore,
      weights
    },
    count: {
      sharedTracks: sharedTrackIds.length,
      sharedTrackArtists: sharedTrackArtists.length,
      sharedTrackGenres: sharedTrackGenres.length,
      sharedProfileArtists: sharedProfileArtists.length,
      sharedProfileGenres: sharedProfileGenres.length
    }
  };
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
