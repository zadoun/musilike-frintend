import React, { useState, useEffect } from 'react';
import './SpotifySearchBar.css';
import API_URL from './api';
console.log('API_URL:', API_URL);

export default function RecommendModal({ open, onClose, track, onSend }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Fetch user list for recommendation
      const token = localStorage.getItem('token');
      if (!token) return;
      fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUsers(data.users || []))
        .catch(() => setUsers([]));
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Recommend Track</h3>
        <div className="modal-section">
          <label>Select user:</label>
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
            <option value="">-- Select a user --</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.username} ({u.email})</option>
            ))}
          </select>
        </div>
        <div className="modal-section">
          <label>Recommendation message:</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} style={{width:'100%'}} />
        </div>
        <div className="modal-section">
          <strong>Track:</strong> {track?.name} by {track?.artists?.map(a => a.name).join(', ')}
          <div>
            <iframe
              src={`https://open.spotify.com/embed/track/${track?.id}`}
              width="280"
              height="80"
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
              title="Spotify Player"
              style={{marginTop:8}}
            ></iframe>
          </div>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <button
          className="modal-send-btn"
          disabled={loading || !selectedUser}
          onClick={async () => {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            try {
              const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                  toUserId: selectedUser,
                  message,
                  track
                })
              });
              if (res.ok) {
                setLoading(false);
                onSend && onSend();
                onClose();
              } else {
                const data = await res.json();
                setError(data.error || 'Could not send recommendation.');
                setLoading(false);
              }
            } catch (err) {
              setError('Network error.');
              setLoading(false);
            }
          }}
        >Send Recommendation</button>
      </div>
    </div>
  );
}
