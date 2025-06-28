// Script to enrich Musiliked tracks in MongoDB by looking up Spotify artist IDs for tracks that only have artist names
// Usage: node enrich_artist_ids_from_names.js <SPOTIFY_ACCESS_TOKEN>

const mongoose = require('mongoose');
const axios = require('axios');
const Musiliked = require('./models/Musiliked');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musilike_mpv_V5';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

if (process.argv.length < 3) {
  console.error('Usage: node enrich_artist_ids_from_names.js <SPOTIFY_ACCESS_TOKEN>');
  process.exit(1);
}
const SPOTIFY_ACCESS_TOKEN = process.argv[2];

async function searchArtistIdByName(artistName, token) {
  try {
    const resp = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: artistName,
        type: 'artist',
        limit: 1
      }
    });
    const items = resp.data.artists.items;
    if (items && items.length > 0) {
      return items[0].id;
    }
    return null;
  } catch (err) {
    console.error(`Error searching for artist '${artistName}':`, err.response?.data || err.message);
    return null;
  }
}

async function enrichArtistIds() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const tracks = await Musiliked.find({});
  console.log(`Found ${tracks.length} tracks in database.`);
  let updated = 0;
  for (const track of tracks) {
    // Only process tracks where artists are names (not IDs) and rawTrack.artists is missing or empty
    if (
      Array.isArray(track.artists) &&
      track.artists.length > 0 &&
      (!track.rawTrack || !Array.isArray(track.rawTrack.artists) || track.rawTrack.artists.length === 0)
    ) {
      let artistIds = [];
      for (const artistName of track.artists) {
        // Skip if it looks like an ID already
        if (typeof artistName === 'string' && artistName.length === 22) {
          artistIds.push(artistName);
        } else {
          const id = await searchArtistIdByName(artistName, SPOTIFY_ACCESS_TOKEN);
          if (id) {
            artistIds.push(id);
            console.log(`Mapped '${artistName}' to Spotify ID: ${id}`);
          } else {
            console.log(`Could not find Spotify ID for artist name: '${artistName}'`);
          }
        }
      }
      if (artistIds.length > 0) {
        // Optionally, update rawTrack.artists as well
        if (!track.rawTrack) track.rawTrack = {};
        track.rawTrack.artists = artistIds.map(id => ({ id }));
        await track.save();
        updated++;
        console.log(`Updated track '${track.trackName}' (${track.trackId}) with artist IDs:`, artistIds);
      }
    }
  }
  console.log(`Done. Updated ${updated} tracks.`);
  process.exit(0);
}

enrichArtistIds();
