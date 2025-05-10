import React, { useState } from 'react';
import API_URL from './api';
import './SpotifySearchBar.css';
import RecommendModal from './RecommendModal';
import MusilikeButton from './MusilikeButton';

function SpotifySearchBar({ onResults, onMusilikedChange }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [musilikedIds, setMusilikedIds] = useState([]);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [recommendTrack, setRecommendTrack] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      // TODO: Replace the following with your backend endpoint for Spotify search
      const res = await fetch(`${API_URL}/api/spotify/search?q=` + encodeURIComponent(query));
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

  // Fetch Musi-Liked track IDs on mount
  React.useEffect(() => {
    const fetchMusiliked = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/musiliked', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          const data = await res.json();
          setMusilikedIds(Array.isArray(data.tracks) ? data.tracks.map(t => t.trackId) : []);
        }
      } catch {}
    };
    fetchMusiliked();
  }, []);

  // Helper to refresh musiliked after like/unlike
  const refreshMusiliked = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/musiliked', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setMusilikedIds(Array.isArray(data.tracks) ? data.tracks.map(t => t.trackId) : []);
      }
    } catch {}
  };

  return (
    <>
      <RecommendModal
        open={recommendOpen}
        onClose={() => setRecommendOpen(false)}
        track={recommendTrack}
        onSend={() => setRecommendOpen(false)}
      />
      <div className="spotify-search-bar">
        <div className="search-info-box">
          Look for music and recommend it to friends<br/>or add it to your favorites !
        </div>
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
                {track.id && (
                  <div className="spotify-embed-player">
                    <iframe
                      src={`https://open.spotify.com/embed/track/${track.id}`}
                      width="280"
                      height="80"
                      frameBorder="0"
                      allowtransparency="true"
                      allow="encrypted-media"
                      title={`Spotify Player for ${track.name}`}
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                )}
                <div className="spotify-search-result-actions" style={{ marginLeft: 24 }}>
                  <button
                    className="recommend-btn"
                    title="Recommend this song!"
                    onClick={() => { setRecommendTrack(track); setRecommendOpen(true); }}
                  >
                    <span role="img" aria-label="music">🎵</span> <span style={{ fontSize: '0.75em' }}>Recommend!</span>
                  </button>
                  <MusilikeButton
  track={track}
  musilikedIds={musilikedIds}
  refreshMusilikedIds={async () => {
    await refreshMusiliked();
    onMusilikedChange && onMusilikedChange();
  }}
/>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default SpotifySearchBar;
