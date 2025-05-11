import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';
import './Compatibility.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { ReactComponent as SuggestRecommendationButton } from './SuggestRecommendationButton.svg';
import { ReactComponent as GetRecommendationButton } from './GetRecommendationButton.svg';
import { ReactComponent as CompatibilityBadge } from './CompatibilityBadge.svg';

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
    <div className="music-profile-container" style={{ minHeight: '100vh', background: '#111', padding: '0 0' }}>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <div className="compat-card">

        {loading && <div>Loading...</div>}
        {result && (
          <React.Fragment>
            {/* Avatar block */}
            <div className="compat-avatar-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 0, width: '100%' }}>
              <div style={{ fontWeight: 700, color: '#FFF2CC', fontSize: 36, margin: '0 0 30px 0', letterSpacing: 1, textAlign: 'center' }}>{users.find(u => u._id === selectedUser)?.username || ''}</div>
              <div className="compat-avatar-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, position: 'relative' }}>
                <button
                  className="compat-avatar-btn left"
                  title={`music recommendations for ${users.find(u => u._id === selectedUser)?.username || ''}`}
                  style={{ background: 'none', color: '#DBB77B',border: 'none', padding: 0, marginRight: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, width: 'auto', height: 'auto' }}
                  onClick={() => recommendations.length > 0 && setShowRecModal(true)}
                  disabled={recommendations.length === 0}
                >
                  <SuggestRecommendationButton width={32} height={32} />
                </button>
                <div style={{ position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    className="compat-avatar"
                    src={users.find(u => u._id === selectedUser)?.profilePicture || 'https://i.imgur.com/1Q9Z1Zm.png'}
                    alt={users.find(u => u._id === selectedUser)?.username + "'s profile"}
                    style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: '50%', border: '2px solid #FFF2CC', boxShadow: '0 2px 8px #0004' }}
                  />
                </div>
                <button
                  className="compat-avatar-btn right"
                  title={`Get music recommendations from ${users.find(u => u._id === selectedUser)?.username || ''}`}
                  style={{ background: 'none', border: 'none', padding: 0, marginLeft: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, width: 'auto', height: 'auto' }}
                  onClick={() => reverseRecs.length > 0 && setShowReverseRecModal(true)}
                  disabled={reverseRecs.length === 0}
                >
                  <GetRecommendationButton width={32} height={32} />
                </button>
              </div>
            </div>
            {/* Compatibility score below avatar block */}
            <div
              className="compat-score-zone"
              onClick={() => setShowModal(true)}
              title="Click for compatibility details"
              style={{ marginTop: 20, marginBottom: 6, padding: '10px 10px 40px 10px', cursor: 'pointer', minWidth: 120 }}>
              <div className="compat-score-row">
                <CompatibilityBadge className="compat-badge-svg" width={32} height={32} style={{ marginRight: 0, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span className="compat-score-value">
                    {(result.scores.weightedScore * 100).toFixed(0)}%
                  </span>
                  <span className="compat-score-label">Compatible</span>
                </div>
              </div>
            </div>
            {/* Last liked music below score */}
            {selectedUserLastTrack && selectedUserLastTrack.spotifyUrl && selectedUserLastTrack.spotifyUrl.includes('spotify.com/track/') && (
              <div style={{ margin: '12px 0 18px 0', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Last liked music</div>
                <iframe
                  title="Spotify Player"
                  src={`https://open.spotify.com/embed/track/${selectedUserLastTrack.spotifyUrl.split('/track/')[1]?.split('?')[0]}`}
                  width="320"
                  height="90"
                  frameBorder="0"
                  allowtransparency="true"
                  allow="encrypted-media"
                  style={{ borderRadius: 10, margin: '0 auto', display: 'block', boxShadow: '0 2px 8px #0002', background: '#222' }}
                />
              </div>
            )}


            {/* Spotify player */}

            {/* Action Buttons */}
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
