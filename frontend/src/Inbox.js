import React, { useEffect, useState } from 'react';
import './SpotifySearchBar.css';
import RecommendationCard from './RecommendationCard';

export default function Inbox() {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [musilikedIds, setMusilikedIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your inbox.');
      setLoading(false);
      return;
    }
    fetch('/api/inbox', {
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
    // Fetch musiliked track ids
    fetch('/api/musiliked', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setMusilikedIds((data.tracks || []).map(t => t.trackId));
      })
      .catch(() => setMusilikedIds([]));
  }, []);

  const handleLikeToggle = (trackId, liked) => {
    setMusilikedIds(ids => liked ? [...ids, trackId] : ids.filter(id => id !== trackId));
  };

  if (loading) return <div className="modal-section">Loading inbox...</div>;
  if (error) return <div className="modal-error">{error}</div>;

  return (
    <div className="inbox-container">
      <h2>Your Recommendations Inbox</h2>
      {inbox.length === 0 ? (
        <div className="modal-section">No recommendations yet.</div>
      ) : (
        <ul className="inbox-list">
          {inbox.map(rec => (
            <RecommendationCard
              key={rec._id}
              rec={rec}
              musilikedIds={musilikedIds}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
