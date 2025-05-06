// src/api.js
// src/api.js
// Determines the backend API URL based on environment
// - Uses REACT_APP_API_URL if set (for production on Vercel)
// - Uses localhost for dev
// - Uses LAN IP for mobile
// - Fallbacks to Render backend for production

let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    API_URL = 'http://localhost:4000'; // Local dev
  } else if (/^192\.168\.\d+\.\d+$/.test(hostname)) {
    API_URL = `http://${hostname}:4000`; // Local LAN/mobile
  } else {
    // Fallback: Use your Render backend for production
    API_URL = 'https://musilike-frintend.onrender.com';
  }
}

export default API_URL;
