// src/api.js
let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  const { hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    API_URL = 'http://localhost:4000';
  } else if (/^192\.168\.\d+\.\d+$/.test(hostname)) {
    API_URL = `http://${hostname}:4000`;
  } else {
    // Fallback to production API URL or another default
    API_URL = 'https://your-production-backend.com';
  }
}

export default API_URL;
