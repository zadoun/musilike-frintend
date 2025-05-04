import React, { useEffect, useState } from 'react';
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
    // Fetch hidden recommendation ids
    fetch('/api/hidden-recommendation', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setHiddenIds(data.hiddenIds || []))
      .catch(() => setHiddenIds([]));
    // Fetch musiliked track ids
    fetch('/api/musiliked', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setMusilikedIds((data.tracks || []).map(t => t.trackId));
      })
      .catch(() => setMusilikedIds([]));
  }, [refreshFlag]);

  const handleLikeToggle = (trackId, liked) => {
    setMusilikedIds(ids => liked ? [...ids, trackId] : ids.filter(id => id !== trackId));
  };

  if (loading) return <div className="modal-section">Loading inbox...</div>;
  if (error) return <div className="modal-error">{error}</div>;

  // Filter out hidden recommendations
  function handleHide(recId) {
    setHiddenIds(ids => [...ids, recId]);
  }
  const visibleInbox = inbox.filter(rec => !hiddenIds.includes(rec._id));

  return (
    <div className="inbox-container">
      <h2>Your Recommendations Inbox</h2>
      {visibleInbox.length === 0 ? (
        <div className="modal-section">No recommendations yet.</div>
      ) : (
        <ul className="inbox-list">
          {visibleInbox.map(rec => (
            <RecommendationCard
              key={rec._id}
              rec={rec}
              musilikedIds={musilikedIds}
              onLikeToggle={handleLikeToggle}
              hidden={hiddenIds.includes(rec._id)}
              onHide={handleHide}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
