import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';

import CompatibilityModal from './CompatibilityModal';
import RecommendationsModal from './RecommendationsModal';

export default function Compatibility({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');
  // Reverse recommendations state
  const [reverseRecs, setReverseRecs] = useState([]);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseError, setReverseError] = useState('');
  // Last liked track for selected user
  const [selectedUserLastTrack, setSelectedUserLastTrack] = useState(null);
  // Modal for compatibility details
  const [showModal, setShowModal] = useState(false);
  // Modal for recommendations
  const [showRecModal, setShowRecModal] = useState(false);
  // Modal for reverse recommendations
  const [showReverseRecModal, setShowReverseRecModal] = useState(false);

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
    setRecommendations([]);
    setRecError('');
    setSelectedUserLastTrack(null); // Reset before fetching
    try {
      const res = await fetch(`${API_URL}/api/musiliked/compatibility?userA=${currentUserId}&userB=${selectedUser}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResult(data);
      // Fetch recommendations
      setRecLoading(true);
      const recRes = await fetch(`${API_URL}/api/musiliked/recommend?userA=${currentUserId}&userB=${selectedUser}&limit=5`);
      if (!recRes.ok) throw new Error('Rec API error');
      const recData = await recRes.json();
      setRecommendations(recData.recommendations || []);
      // Fetch reverse recommendations
      setReverseLoading(true);
      setReverseError('');
      setReverseRecs([]);
      const reverseRes = await fetch(`${API_URL}/api/musiliked/recommend-reverse?userA=${currentUserId}&userB=${selectedUser}&limit=5`);
      if (!reverseRes.ok) throw new Error('Reverse Rec API error');
      const reverseData = await reverseRes.json();
      setReverseRecs(reverseData.recommendations || []);
      // Fetch last liked track for selected user
      const lastTrackRes = await fetch(`${API_URL}/api/musiliked/user/${selectedUser}`);
      if (lastTrackRes.ok) {
        const lastTrackData = await lastTrackRes.json();
        if (Array.isArray(lastTrackData.tracks) && lastTrackData.tracks.length > 0) {
          // Sort by createdAt descending if available
          const sortedTracks = [...lastTrackData.tracks].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setSelectedUserLastTrack(sortedTracks[0]);
        }
      }
    } catch (e) {
      if (e.message.includes('Rec API')) setRecError('Could not fetch recommendations.');
      else if (e.message.includes('Reverse Rec API')) setReverseError('Could not fetch reverse recommendations.');
      else setError('Could not fetch compatibility.');
    }
    setLoading(false);
    setRecLoading(false);
    setReverseLoading(false);
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
          {/* Profile Picture above the score */}
          {(() => {
            const selectedUserObj = users.find(u => u._id === selectedUser);
            if (selectedUserObj?.profilePicture) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
                  <img
                    src={selectedUserObj.profilePicture}
                    alt={selectedUserObj.username + "'s profile"}
                    style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1db954', background: '#eee' }}
                  />
                  {/* Last liked track below avatar */}
                  {selectedUserLastTrack && selectedUserLastTrack.spotifyUrl && selectedUserLastTrack.spotifyUrl.includes('spotify.com/track/') && (
                    <div style={{ marginTop: 10, marginBottom: 10, width: '100%', textAlign: 'center' }}>
                      <iframe
                        title="Spotify Player"
                        src={`https://open.spotify.com/embed/track/${selectedUserLastTrack.spotifyUrl.split('/track/')[1]?.split('?')[0]}`}
                        width="320"
                        height="90"
                        frameBorder="0"
                        allowtransparency="true"
                        allow="encrypted-media"
                        style={{ borderRadius: 8, margin: '0 auto', display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}
          <div
            style={{
              fontSize: '1.22em', fontWeight: 600, marginBottom: 10, cursor: 'pointer',
              border: '2px solid #1db954', borderRadius: 8, padding: '8px 16px', display: 'inline-block', background: '#fff', transition: 'background 0.2s',
            }}
            onClick={() => setShowModal(true)}
            title="Click for compatibility details"
            onMouseOver={e => e.currentTarget.style.background = '#eafbee'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            <span style={{ color: '#1db954' }}>Compatibility Score:</span> <span style={{ color: '#1db954' }}>{(result.scores.weightedScore * 100).toFixed(1)}%</span>
          </div>
          <CompatibilityModal
            open={showModal}
            onClose={() => setShowModal(false)}
            result={result}
            users={users}
            selectedUser={selectedUser}
          />
          <div style={{ marginTop: 24 }}>
            <b
              style={{
                cursor: recommendations.length > 0 ? 'pointer' : 'default',
                color: recommendations.length > 0 ? '#1db954' : undefined,
                border: '2px solid #1db954', borderRadius: 8, padding: '8px 16px', display: 'inline-block', background: '#fff', transition: 'background 0.2s', marginRight: 12
              }}
              onClick={() => recommendations.length > 0 && setShowRecModal(true)}
              onMouseOver={e => { if (recommendations.length > 0) e.currentTarget.style.background = '#eafbee'; }}
              onMouseOut={e => { if (recommendations.length > 0) e.currentTarget.style.background = '#fff'; }}
            >Recommended Tracks for you from list of {users.find(u => u._id === selectedUser)?.username || 'selected user'}:</b>
            {recLoading && <div>Loading recommendations...</div>}
            {recError && <div style={{ color: 'red' }}>{recError}</div>}
          </div>
          <RecommendationsModal
            open={showRecModal}
            onClose={() => setShowRecModal(false)}
            recommendations={recommendations}
            title={"Recommended Tracks"}
            subtitle={users.find(u => u._id === selectedUser)?.username ? `for ${users.find(u => u._id === selectedUser)?.username}` : undefined}
          />
          {/* Reverse recommendations section */}
          <div style={{ marginTop: 24 }}>
            <b
              style={{
                cursor: reverseRecs.length > 0 ? 'pointer' : 'default',
                color: reverseRecs.length > 0 ? '#1db954' : undefined,
                border: '2px solid #1db954', borderRadius: 8, padding: '8px 16px', display: 'inline-block', background: '#fff', transition: 'background 0.2s', marginRight: 12
              }}
              onClick={() => reverseRecs.length > 0 && setShowReverseRecModal(true)}
              onMouseOver={e => { if (reverseRecs.length > 0) e.currentTarget.style.background = '#eafbee'; }}
              onMouseOut={e => { if (reverseRecs.length > 0) e.currentTarget.style.background = '#fff'; }}
            >Recommended Tracks for {users.find(u => u._id === selectedUser)?.username || 'selected user'} from your list:</b>
            {reverseLoading && <div>Loading reverse recommendations...</div>}
            {reverseError && <div style={{ color: 'red' }}>{reverseError}</div>}
          </div>
          <RecommendationsModal
            open={showReverseRecModal}
            onClose={() => setShowReverseRecModal(false)}
            recommendations={reverseRecs}
            title={"Recommended Tracks"}
            subtitle={users.find(u => u._id === selectedUser)?.username ? `for ${users.find(u => u._id === selectedUser)?.username}` : undefined}
          />
        </div>
      )}
    </div>
  );
}
