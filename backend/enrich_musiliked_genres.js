// Script to enrich Musiliked tracks in MongoDB with genres from Spotify API (via artist genres)
// Usage: node enrich_musiliked_genres.js <SPOTIFY_ACCESS_TOKEN>

const mongoose = require('mongoose');
const axios = require('axios');
const Musiliked = require('./models/Musiliked');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musilike_mpv_V5';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

if (process.argv.length < 3) {
  console.error('Usage: node enrich_musiliked_genres.js <SPOTIFY_ACCESS_TOKEN>');
  process.exit(1);
}
const SPOTIFY_ACCESS_TOKEN = process.argv[2];

async function getArtistGenres(artistId, cache, token) {
  if (cache[artistId]) return cache[artistId];
  try {
    const resp = await axios.get(`${SPOTIFY_API_BASE}/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    cache[artistId] = resp.data.genres || [];
    return cache[artistId];
  } catch (err) {
    console.error(`Error fetching artist ${artistId}:`, err.response?.data || err.message);
    cache[artistId] = [];
    return [];
  }
}

async function enrichAllTracks() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const tracks = await Musiliked.find({});
  console.log(`Found ${tracks.length} tracks in database.`);
  const artistGenreCache = {};
  let updated = 0;
  for (const track of tracks) {
    // Prefer artists as Spotify IDs, else extract from rawTrack.artists
    let artistIds = [];
    if (Array.isArray(track.artists) && track.artists.length > 0 && track.artists[0].length === 22) {
      artistIds = track.artists;
    } else if (track.rawTrack && Array.isArray(track.rawTrack.artists)) {
      artistIds = track.rawTrack.artists.map(a => a.id).filter(Boolean);
    }
    if (!track.trackName) {
      console.log('Track with no name:', track);
    }
    if (!artistIds.length) {
      console.log(`Track: ${track.trackName} | No artist IDs found. (artists:`, track.artists, ")");
    } else {
      console.log(`Track: ${track.trackName} | Extracted artist IDs:`, artistIds);
    }
    let genresSet = new Set();
    for (const artistId of artistIds) {
      const genres = await getArtistGenres(artistId, artistGenreCache, SPOTIFY_ACCESS_TOKEN);
      genres.forEach(g => genresSet.add(g));
    }
    const genresArr = Array.from(genresSet);
    console.log(`Genres found for "${track.trackName}":`, genresArr);
    if (genresArr.length > 0 && JSON.stringify(track.genres||[]) !== JSON.stringify(genresArr)) {
      track.genres = genresArr;
      await track.save();
      updated++;
      console.log(`Updated track ${track.trackId} with genres:`, genresArr);
    }
  }
  console.log(`Done. Updated ${updated} tracks.`);
  await mongoose.disconnect();
}

enrichAllTracks().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
