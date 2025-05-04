import React, { useState } from 'react';
import './SpotifySearchBar.css';

function SpotifySearchBar({ onResults }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      // TODO: Replace the following with your backend endpoint for Spotify search
      const res = await fetch('/api/spotify/search?q=' + encodeURIComponent(query));
      let text = await res.text();
      if (!res.ok) {
        console.error('Spotify search failed:', res.status, text);
        throw new Error('Search failed: ' + res.status);
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error('Spotify search: Could not parse JSON:', text);
        setError('Unexpected response from server.');
        return;
      }
      console.log('Spotify API response:', data);
      setResults(data.tracks || []);
      onResults && onResults(data.tracks || []);
    } catch (err) {
      setError('Could not fetch results.');
      console.error('Spotify search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spotify-search-bar">
      <form onSubmit={handleSearch} className="spotify-search-form">
        <input
          type="text"
          placeholder="Search Spotify tracks..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </form>
      {error && <div className="spotify-search-error">{error}</div>}
      {results.length > 0 && (
        <ul className="spotify-search-results">
          {results.map(track => (
            <li key={track.id} className="spotify-search-result-item">
              {track.album && track.album.images && track.album.images[0] && (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="spotify-album-image"
                />
              )}
              <span className="spotify-track-info">
                <strong>{track.name}</strong>
                <div className="spotify-artist-name">
                  {track.artists && track.artists.map(a => a.name).join(', ')}
                </div>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SpotifySearchBar;
