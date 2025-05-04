let spotifyToken = null;
let tokenExpires = 0;

async function fetchESM(...args) {
  const mod = await import('node-fetch');
  return mod.default(...args);
}

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpires) {
    return spotifyToken;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetchESM('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  spotifyToken = data.access_token;
  tokenExpires = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

async function searchSpotifyTracks(query) {
  const token = await getSpotifyToken();
  const res = await fetchESM(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.tracks ? data.tracks.items : [];
}

module.exports = { searchSpotifyTracks };
