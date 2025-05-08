require('dotenv').config();
// Script Node.js pour remplir automatiquement les IDs Spotify dans la liste statique d'artistes
// Utilisation : node fill_spotify_ids.js

const fetch = (...args) => import('node-fetch').then(m => m.default(...args));
const fs = require('fs');
const path = require('path');

// === CONFIGURATION ===
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const STATIC_ARTISTS_PATH = path.join(__dirname, 'spotify.js'); // Fichier à modifier

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('Configurez SPOTIFY_CLIENT_ID et SPOTIFY_CLIENT_SECRET dans vos variables d\'environnement.');
  process.exit(1);
}

async function getSpotifyToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

async function getSpotifyArtistData(name, token) {
  const url = `https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(name)}&limit=1`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (data.artists && data.artists.items && data.artists.items[0]) {
    const artist = data.artists.items[0];
    return {
      id: artist.id,
      images: artist.images || [],
    };
  }
  return null;
}

async function main() {
  let file = fs.readFileSync(STATIC_ARTISTS_PATH, 'utf-8');
  const staticArtistsMatch = file.match(/const STATIC_ARTISTS = \[(.|\n)*?\];/);
  if (!staticArtistsMatch) {
    console.error('Impossible de trouver STATIC_ARTISTS dans spotify.js');
    process.exit(1);
  }

  // Extraction du tableau d'artistes
  let artistsCode = staticArtistsMatch[0];
  let artistsList = eval(artistsCode.replace('const STATIC_ARTISTS = ', ''));

  const token = await getSpotifyToken();
  for (let artist of artistsList) {
    if (!artist.id || artist.id.startsWith(artist.genre) || !artist.images) {
      const spotifyData = await getSpotifyArtistData(artist.name, token);
      if (spotifyData && spotifyData.id) {
        artist.id = spotifyData.id;
        artist.images = spotifyData.images;
        console.log(`[OK] ${artist.name} => ${spotifyData.id} (images: ${spotifyData.images && spotifyData.images.length ? 'oui' : 'non'})`);
      } else {
        console.log(`[NOT FOUND] ${artist.name}`);
      }
    }
  }

  // Remplacement dans le code source
  let newArtistsCode = 'const STATIC_ARTISTS = ' + JSON.stringify(artistsList, null, 2) + ';';
  file = file.replace(staticArtistsMatch[0], newArtistsCode);
  fs.writeFileSync(STATIC_ARTISTS_PATH, file, 'utf-8');
  console.log('Mise à jour terminée dans spotify.js !');
}

main();
