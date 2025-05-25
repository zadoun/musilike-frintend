require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const { searchSpotifyTracks, getPopularArtistsByGenre, getMixedArtistsByGenre, getPopularTracksByArtists } = require('./spotify');
const MusilikedController = require('./MusilikedController');
const RecommendController = require('./RecommendController');
const HiddenRecommendationController = require('./HiddenRecommendationController');

const app = express();
const PORT = process.env.PORT || 4000;

// --- SOCKET.IO SETUP ---
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
      'https://c7a6-2a01-e0a-1ce-c2b0-d510-ce1d-a858-6585.ngrok-free.app',
    ],
    credentials: true,
  }
});

// Track connected users by userId
const userSocketMap = {};
io.on('connection', (socket) => {
  // Client should emit 'register' with their userId after connecting
  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
    console.log('Registered socket for user:', userId, 'socket:', socket.id);
  });
  socket.on('disconnect', () => {
    for (const [userId, id] of Object.entries(userSocketMap)) {
      if (id === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

module.exports.io = io;
module.exports.userSocketMap = userSocketMap;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musilike_mpv_V5';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://192.168.1.72:3000', // <-- Added local network frontend for mobile access
    'https://musilike-frintend.vercel.app', // <-- your Vercel frontend URL
  ],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Email, password, and username required.' });
  }
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, username });
    await user.save();
    res.status(201).json({ message: 'User registered.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, email: user.email, username: user.username, _id: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Update liked genres (protected)
app.put('/api/profile/genres', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { genres } = req.body;
    if (!Array.isArray(genres)) return res.status(400).json({ error: 'Genres must be an array.' });
    user.musiliked_genres = genres;
    await user.save();
    res.json({ message: 'Genres updated.', musiliked_genres: user.musiliked_genres });
  } catch (err) {
    res.status(500).json({ error: 'Could not update genres.' });
  }
});

// --- Nouvel endpoint : artistes mixtes (statique + Spotify) par genre ---
app.get('/api/spotify/mixed-artists-by-genre', async (req, res) => {
  const genre = req.query.genre;
  if (!genre) return res.status(400).json({ error: 'Genre required.' });
  try {
    const artists = await getMixedArtistsByGenre(genre);
    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch mixed artists.' });
  }
});

// Update liked artistes (protected)
app.put('/api/profile/artistes', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { artistes } = req.body;
    if (!Array.isArray(artistes)) return res.status(400).json({ error: 'Artistes must be an array.' });
    user.musiliked_artistes = artistes;
    await user.save();
    res.json({ message: 'Artistes updated.', musiliked_artistes: user.musiliked_artistes });
  } catch (err) {
    res.status(500).json({ error: 'Could not update artistes.' });
  }
});


// Profile endpoint for current user
app.get('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({
      email: user.email,
      username: user.username,
      _id: user._id,
      musiliked_genres: user.musiliked_genres,
      musiliked_artistes: user.musiliked_artistes,
      profilePicture: user.profilePicture,
      birthday: user.birthday,
      gender: user.gender,
      city: user.city,
      location: user.location,
      musicSkills: user.musicSkills
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// PUT /api/profile - update profile fields (profilePicture, birthday, gender)
app.put('/api/profile', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided.' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const { profilePicture, birthday, gender, city, location, musicSkills } = req.body;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (birthday !== undefined) user.birthday = birthday;
    if (gender !== undefined) user.gender = gender;
    if (city !== undefined) user.city = city;
    if (location !== undefined) user.location = location;
    if (musicSkills !== undefined) {
      // Update the musicSkills object as a whole or merge fields
      user.musicSkills = {
        ...user.musicSkills,
        ...musicSkills
      };
    }

    await user.save();
    res.json({
      message: 'Profile updated.',
      profilePicture: user.profilePicture,
      birthday: user.birthday,
      gender: user.gender,
      city: user.city,
      location: user.location,
      musicSkills: user.musicSkills
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// Recommend endpoints
app.get('/api/users', RecommendController.listUsers);

// GET /api/users/:id - Public profile by MongoDB _id
app.get('/api/users/:id', async (req, res) => {
  try {
    console.log('[API] GET /api/users/:id requested for', req.params.id);
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('[API] User not found for id', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }
    // Log the user object (omit sensitive fields if needed)
    console.log('[API] User found:', user);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      age: user.age,
      city: user.city,
      gender: user.gender,
      birthday: user.birthday,
      location: user.location,
      musicSkills: user.musicSkills || {},
      singer: user.musicSkills?.isSinger ?? false,
      musician: user.musicSkills?.isMusician ?? false,
    });
  } catch (err) {
    console.error('[API] Error in GET /api/users/:id', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/recommend', RecommendController.sendRecommendation);
app.get('/api/inbox', RecommendController.getInbox);
app.post('/api/recommendation/:id/react', RecommendController.reactToRecommendation);

// Sent Recommendations endpoint
app.get('/api/recommendations/sent', RecommendController.getSentRecommendations);

// Hidden Recommendation endpoints
app.post('/api/hidden-recommendation', HiddenRecommendationController.hideRecommendation);
app.get('/api/hidden-recommendation', HiddenRecommendationController.listHiddenRecommendations);

// Musi-Liked endpoints
app.post('/api/musiliked', MusilikedController.addMusiliked);
app.delete('/api/musiliked/:trackId', MusilikedController.deleteMusiliked);
app.get('/api/musiliked', MusilikedController.getMusiliked);
app.get('/api/musiliked/user/:userId', MusilikedController.getMusilikedForUser);
app.get('/api/musiliked/compatibility', MusilikedController.getCompatibility);
app.get('/api/musiliked/recommend', MusilikedController.getRecommendations);
app.get('/api/musiliked/recommend-reverse', MusilikedController.getReverseRecommendations);

// Endpoint pour obtenir les morceaux populaires par artistes sélectionnés
app.post('/api/spotify/popular-tracks-by-artists', async (req, res) => {
  const { artistIds } = req.body;
  if (!Array.isArray(artistIds) || artistIds.length === 0)
    return res.status(400).json({ error: 'artistIds must be a non-empty array' });
  try {
    const tracks = await getPopularTracksByArtists(artistIds);
    res.json({ tracks });
  } catch (err) {
    res.status(500).json({ error: 'Spotify track fetch failed' });
  }
});

// Endpoint pour artistes populaires par genre
app.get('/api/spotify/artists-by-genre', async (req, res) => {
  const genre = req.query.genre;
  if (!genre) return res.status(400).json({ error: 'Missing genre' });
  try {
    const artists = await getPopularArtistsByGenre(genre);
    res.json({ artists });
  } catch (err) {
    res.status(500).json({ error: 'Spotify artist fetch failed' });
  }
});

// Spotify Search Endpoint
app.get('/api/spotify/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const tracks = await searchSpotifyTracks(q);
    res.json({ tracks });
  } catch (err) {
    res.status(500).json({ error: 'Spotify search failed' });
  }
});

// Choose host: 'localhost' for desktop-only dev, '0.0.0.0' for LAN/mobile/local network, or override with HOST env
let HOST;
if (process.env.HOST) {
  HOST = process.env.HOST;
} else if (process.env.NODE_ENV === 'production') {
  HOST = '0.0.0.0';
} else if (process.env.LOCAL_LAN === 'true') {
  HOST = '0.0.0.0';
} else {
  HOST = 'localhost';
}
http.listen(PORT, HOST, () => {
  console.log(`Backend running on http://${HOST === '0.0.0.0' ? 'your-local-ip' : HOST}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log('For mobile/local network testing, use your local IP address (e.g., http://192.168.x.x:4000) in your frontend or device browser.');
  }
});
