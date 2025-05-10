import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';
import './Compatibility.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import CompatibilityModal from './CompatibilityModal';
import RecommendationsModal from './RecommendationsModal';
import SpotifyPlayerWithBounce from './SpotifyPlayerWithBounce';

export default function Compatibility({ currentUserId, users, selectedUser, setSelectedUser }) {

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

  // Automatically trigger compare when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      handleCompare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  return (
    <div className="music-profile-container" style={{ minHeight: '100vh', background: '#111', padding: '36px 0' }}>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <div className="compat-card">

        {loading && <div>Loading...</div>}
        {result && (
          <React.Fragment>
            <div className="compat-avatar-wrapper" style={{position: 'relative', width: 320, height: 320, margin: '0 auto 18px auto'}}>
              <img
                className="compat-avatar"
                src={users.find(u => u._id === selectedUser)?.profilePicture || 'https://i.imgur.com/1Q9Z1Zm.png'}
                alt={users.find(u => u._id === selectedUser)?.username + "'s profile"}
              />
              <div
                className="compat-score-zone"
                onClick={() => setShowModal(true)}
                title="Click for compatibility details"
                style={{position: 'absolute', left: 0, right: 0, bottom: 0, width: 320, margin: '0 auto'}}>
                <div className="compat-score-value">
                  {(result.scores.weightedScore * 100).toFixed(0)}%
                </div>
                <div className="compat-score-label">Compatibility Score</div>
              </div>
            </div>
            {/* Spotify player */}
            {selectedUserLastTrack && selectedUserLastTrack.spotifyUrl && selectedUserLastTrack.spotifyUrl.includes('spotify.com/track/') && (
              <div style={{ margin: '12px 0 20px 0', width: '100%', textAlign: 'center' }}>
                <iframe
                  title="Spotify Player"
                  src={`https://open.spotify.com/embed/track/${selectedUserLastTrack.spotifyUrl.split('/track/')[1]?.split('?')[0]}`}
                  width="320"
                  height="90"
                  frameBorder="0"
                  allowtransparency="true"
                  allow="encrypted-media"
                  style={{ borderRadius: 8, margin: '0 auto', display: 'block', boxShadow: '0 2px 8px #0002' }}
                />
              </div>
            )}
            {/* Action Buttons */}
            <div className="compat-btn-group">
              <button
                className="compat-action-btn recommend"
                disabled={recommendations.length === 0}
                onClick={() => recommendations.length > 0 && setShowRecModal(true)}
              >
                Recommend Music to {users.find(u => u._id === selectedUser)?.username || ''}
              </button>
              <button
                className="compat-action-btn get"
                disabled={reverseRecs.length === 0}
                onClick={() => reverseRecs.length > 0 && setShowReverseRecModal(true)}
              >
                Get Music from {users.find(u => u._id === selectedUser)?.username || ''}
              </button>
            </div>
            <CompatibilityModal
              open={showModal}
              onClose={() => setShowModal(false)}
              result={result}
              users={users}
              selectedUser={selectedUser}
            />
            <RecommendationsModal
              open={showRecModal}
              onClose={() => setShowRecModal(false)}
              recommendations={recommendations}
              title={"Recommended Tracks"}
              subtitle={users.find(u => u._id === selectedUser)?.username ? `for ${users.find(u => u._id === selectedUser)?.username}` : undefined}
            />
            <RecommendationsModal
              open={showReverseRecModal}
              onClose={() => setShowReverseRecModal(false)}
              recommendations={reverseRecs}
              title={"Recommended Tracks"}
              subtitle={users.find(u => u._id === selectedUser)?.username ? `from your list to ${users.find(u => u._id === selectedUser)?.username}` : undefined}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

