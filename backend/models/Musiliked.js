const mongoose = require('mongoose');

const MusilikedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackId: { type: String, required: true }, // Spotify track ID
  trackName: String,
  artists: [String],
  albumName: String,
  albumImage: String,
  spotifyUrl: String,
  rawTrack: {}, // Store the full track object if needed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Musiliked', MusilikedSchema);
