import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';

export default function Compatibility({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all users except self
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUsers((data.users || []).filter(u => u._id !== currentUserId));
      })
      .catch(() => setUsers([]));
  }, [currentUserId]);

  // Handle compatibility fetch
  const handleCompare = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/musiliked/compatibility?userA=${currentUserId}&userB=${selectedUser}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Could not fetch compatibility.');
    }
    setLoading(false);
  };

  return (
    <div className="music-profile-container">
      <h2 className="music-profile-title">Compare Music Compatibility</h2>
      <div style={{ marginBottom: 18 }}>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          style={{ padding: '0.5em', minWidth: 180 }}
        >
          <option value="">Select another user...</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select>
        <button
          onClick={handleCompare}
          disabled={!selectedUser || loading}
          style={{ marginLeft: 12, padding: '0.5em 1.1em', fontWeight: 600 }}
        >Compare</button>
      </div>
      {loading && <div>Loading compatibility...</div>}
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {result && (
        <div className="music-profile-list" style={{ marginTop: 18 }}>
          <div style={{ fontSize: '1.22em', fontWeight: 600, marginBottom: 10 }}>
            Compatibility Score: <span style={{ color: '#1db954' }}>{(result.scores.weightedScore * 100).toFixed(1)}%</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Tracks:</b> {result.count.sharedTracks} shared
            <br />
            <b>Artists:</b> {result.count.sharedArtists} shared
            <br />
            <b>Genres:</b> {result.count.sharedGenres} shared
          </div>
          <div style={{ margin: '10px 0 6px 0', color: '#888' }}>
            <small>Weights: Track {Math.round(result.scores.weights.track*100)}% | Artist {Math.round(result.scores.weights.artist*100)}% | Genre {Math.round(result.scores.weights.genre*100)}%</small>
          </div>
          <div style={{ marginTop: 12 }}>
            {result.sharedTracks.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <b>Shared Tracks:</b>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {result.sharedTracks.map(t => (
                    <li key={t.trackId} style={{ marginBottom: 4 }}>{t.trackName} <span style={{ color: '#888', fontSize: '0.95em' }}>({(t.artists||[]).join(', ')})</span></li>
                  ))}
                </ul>
              </div>
            )}
            {result.sharedArtists.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <b>Shared Artists:</b> {result.sharedArtists.join(', ')}
              </div>
            )}
            {result.sharedGenres.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <b>Shared Genres:</b> {result.sharedGenres.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
