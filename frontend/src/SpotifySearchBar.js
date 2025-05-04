import React, { useState } from 'react';
import './SpotifySearchBar.css';
import RecommendModal from './RecommendModal';

function SpotifySearchBar({ onResults }) {
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
            <li key={track.id} className="spotify-search-result-item" style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 12, maxWidth: 120 }}>
                <button
                  className="recommend-btn"
                  style={{ background: '#e3f2fd', color: '#1976d2', border: '1px solid #90caf9', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85em', marginTop: 4, marginLeft: 8, width: '90px', minWidth: '70px', maxWidth: '120px' }}
                  title="Recommend this song!"
                  onClick={() => { setRecommendTrack(track); setRecommendOpen(true); }}
                >
                  <span role="img" aria-label="recommend">📤</span> <span style={{ fontSize: '0.75em' }}>Recommend!</span>
                </button>
                <button
                  className={`like-btn ${musilikedIds.includes(track.id) ? 'liked' : 'unliked'}`}
                  title={musilikedIds.includes(track.id) ? 'Remove Musi-Like' : 'Musi-Like this song!'}
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('Please log in to like tracks.');
                      return;
                    }
                    try {
                      if (!musilikedIds.includes(track.id)) {
                        // Like
                        const res = await fetch('/api/musiliked', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token,
                          },
                          body: JSON.stringify({
                            trackId: track.id,
                            trackName: track.name,
                            artists: track.artists ? track.artists.map(a => a.name) : [],
                            albumName: track.album ? track.album.name : '',
                            albumImage: track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : '',
                            spotifyUrl: track.external_urls ? track.external_urls.spotify : '',
                            rawTrack: track,
                          })
                        });
                        if (res.ok) {
                          await refreshMusiliked();
                        } else {
                          const data = await res.json();
                          alert('Error: ' + (data.error || 'Could not like track.'));
                        }
                      } else {
                        // Unlike
                        const res = await fetch(`/api/musiliked/${track.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': 'Bearer ' + token,
                          },
                        });
                        if (res.ok) {
                          await refreshMusiliked();
                        } else {
                          const data = await res.json();
                          // If 404 (track not found), treat as success for UI
                          if (res.status === 404) {
                            await refreshMusiliked();
                          } else {
                            alert('Error: ' + (data.error || 'Could not unlike track.'));
                          }
                        }
                      }
                    } catch (err) {
                      alert('Network error.');
                    }
                  }}
                >
                  <span role="img" aria-label="thumb up">👍</span> <span style={{ fontSize: '0.75em' }}>{musilikedIds.includes(track.id) ? 'Musi-Liked' : 'Musi-Like'}</span>
                </button>
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
