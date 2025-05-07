import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './SpotifySearchBar.css';
import RecommendationCard from './RecommendationCard';

export default function Inbox({ refreshFlag }) {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [musilikedIds, setMusilikedIds] = useState([]);
  const [hiddenIds, setHiddenIds] = useState([]);

  // Fetch inbox, musiliked tracks, and hidden recommendations on mount and when refreshFlag changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your inbox.');
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/inbox`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setInbox(data.inbox || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load inbox.');
        setLoading(false);
      });
    // Fetch hidden recommendation ids
    fetch(`${API_URL}/api/hidden-recommendation`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setHiddenIds(data.hiddenIds || []))
      .catch(() => setHiddenIds([]));
    // Fetch musiliked track ids
    fetch(`${API_URL}/api/musiliked`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setMusilikedIds((data.tracks || []).map(t => t.trackId));
      })
      .catch(() => setMusilikedIds([]));
  }, [refreshFlag]);

  const refreshMusilikedIds = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/musiliked`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setMusilikedIds((data.tracks || []).map(t => t.trackId));
      }
    } catch {}
  };

  const handleLikeToggle = async (track, liked) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (liked) {
        // Like
        const res = await fetch(`${API_URL}/api/musiliked`, {
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
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          if (data.error && data.error.toLowerCase().includes('already musi-liked')) {
            refreshMusilikedIds();
            return;
          } else {
            alert('Error: ' + (data.error || 'Could not like track.'));
          }
        }
      } else {
        // Unlike
        await fetch(`${API_URL}/api/musiliked/${track.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });
      }
    } catch (err) {
      // Optionally show error/toast here
    }
    refreshMusilikedIds();
  };

  // Filter out hidden recommendations
  function handleHide(recId) {
    setHiddenIds(ids => [...ids, recId]);
  }
  const visibleInbox = inbox.filter(rec => !hiddenIds.includes(rec._id));

  // Track seen recommendations in localStorage
  const [seenIds, setSeenIds] = React.useState(() => {
    const stored = localStorage.getItem('seenInboxIds');
    return stored ? JSON.parse(stored) : [];
  });

  // Handler to mark a recommendation as seen
  const markAsSeen = (id) => {
    if (!seenIds.includes(id)) {
      const updated = [...seenIds, id];
      setSeenIds(updated);
      localStorage.setItem('seenInboxIds', JSON.stringify(updated));
    }
  };

  // Sort by most recent (createdAt descending)
  const sortedInbox = [...visibleInbox].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <div className="modal-section">Loading inbox...</div>;
  if (error) return <div className="modal-error">{error}</div>;

  return (
    <div className="inbox-container">
      <h2>Your Recommendations Inbox</h2>
      {sortedInbox.length === 0 ? (
        <div className="modal-section">No recommendations yet.</div>
      ) : (
        <ul className="inbox-list">
          {sortedInbox.map(rec => (
            <li key={rec._id}>
              <RecommendationCard
                rec={rec}
                musilikedIds={musilikedIds}
                onLikeToggle={handleLikeToggle}
                onRefreshMusilikedIds={refreshMusilikedIds}
                hidden={hiddenIds.includes(rec._id)}
                onHide={handleHide}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
