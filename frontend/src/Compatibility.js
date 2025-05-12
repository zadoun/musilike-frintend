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

// Helper to render stars for skill level
function renderStars(level) {
  // Map level to number of stars (beginner=1, intermediate=2, advanced=3)
  let stars = 1;
  if (level === 'intermediate') stars = 2;
  if (level === 'advanced') stars = 3;
  const filled = '★'.repeat(stars);
  const empty = '☆'.repeat(3 - stars);
  return (
    <span style={{ color: '#BFA05A', fontSize: 17, marginLeft: 3 }}>
      {filled}{empty}
    </span>
  );
}

export default function Compatibility({ currentUserId, users, selectedUser, setSelectedUser }) {
  const [showProfileBubble, setShowProfileBubble] = useState(false);
  const [profileUser, setProfileUser] = useState(null);

  // Fetch latest profile when modal opens
  useEffect(() => {
    if (!showProfileBubble || !selectedUser) return;
    console.log('[ProfileBubble] Fetching user profile for id:', selectedUser);
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${selectedUser}`);
        if (res.ok) {
          const data = await res.json();
          console.log('[ProfileBubble] Fetched user data from backend:', data);
          setProfileUser(data);
        } else {
          const fallback = users.find(u => u._id === selectedUser) || null;
          console.warn('[ProfileBubble] Backend fetch failed, using fallback from users[]:', fallback);
          setProfileUser(fallback);
        }
      } catch (err) {
        const fallback = users.find(u => u._id === selectedUser) || null;
        console.error('[ProfileBubble] Error fetching user profile:', err, 'Using fallback:', fallback);
        setProfileUser(fallback);
      }
    };
    fetchProfile();
  }, [showProfileBubble, selectedUser, users]);

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
    <div className="music-profile-container" style={{ minHeight: '0vh', background: '#111', padding: '0 0' }}>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <div className="compat-card">

        {loading && <div>Loading...</div>}
        {result && (
          <>

            {/* Avatar block */}
            <div className="compat-avatar-block" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
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
                <div style={{ position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <img
                    className="compat-avatar"
                    src={users.find(u => u._id === selectedUser)?.profilePicture || 'https://i.imgur.com/1Q9Z1Zm.png'}
                    alt="User Avatar"
                    style={{ cursor: 'pointer', width: 150, height: 150, objectFit: 'cover', borderRadius: '50%', border: '2px solid #FFF2CC', boxShadow: '0 2px 8px #0004', display: 'block', margin: '0 auto' }}
                    onClick={() => setShowProfileBubble(v => !v)}
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
            {showProfileBubble && profileUser && (
  (() => { console.log('[DEBUG] profileUser:', profileUser); return null; })(),
  <div className="profile-bubble-slide" style={{
    marginTop: 8,
    display: 'flex',
    justifyContent: 'center',
    animation: 'slideDown 0.35s cubic-bezier(.42,1.2,.47,.97)'
  }}>
    <div className="profile-bubble-bubble">
      <div className="profile-bubble-pointer" />
      <div className="profile-bubble-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 18, color: '#8C7B5C', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span role="img" aria-label="location">📍</span> {profileUser.city || profileUser.location?.city || (profileUser.location && profileUser.location.latitude && profileUser.location.longitude ? 'Unknown city' : 'N/A')}
                      </span>
                      <span style={{ fontSize: 18, color: '#8C7B5C' }}>{profileUser.age ? profileUser.age + ' ans' : (profileUser.birthday ? (new Date().getFullYear() - new Date(profileUser.birthday).getFullYear()) + ' ans' : 'N/A')}</span>
                      <span style={{ fontSize: 18, color: '#8C7B5C' }}>{profileUser.gender === 'female' ? '♀' : profileUser.gender === 'male' ? '♂' : ''}</span>
                    </div>
                    {/* Music skills */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {/* Singer fallback logic */}
{(profileUser.musicSkills?.isSinger || profileUser.singer) && (
  <div style={{ display: 'flex', alignItems: 'center', fontSize: 17, color: '#BFA05A', gap: 8 }}>
    <span role="img" aria-label="mic">🎤</span> Singer {renderStars(profileUser.musicSkills?.singerLevel || 'beginner')}
  </div>
)}
{/* Musician instrument list, always show all instruments if present */}
{(profileUser.musicSkills?.isMusician || profileUser.musician) && (
  Array.isArray(profileUser.musicSkills?.instruments) && profileUser.musicSkills.instruments.length > 0 ? (
    profileUser.musicSkills.instruments.map((inst, idx) => (
      <div key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: 17, color: '#BFA05A', gap: 8 }}>
        <span role="img" aria-label={inst.name}>🎸</span> {inst.name} {renderStars(inst.level || 'beginner')}
      </div>
    ))
  ) : (
    // Only show fallback if array is missing or empty
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 17, color: '#BFA05A', gap: 8 }}>
      <span role="img" aria-label="instrument">🎸</span> Instrument {renderStars('beginner')}
    </div>
  )
)}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              recommendations={reverseRecs}
              title={"Recommended Tracks"}
              subtitle={users.find(u => u._id === selectedUser)?.username ? `for ${users.find(u => u._id === selectedUser)?.username}` : undefined}
            />
            <CompatibilityModal
              open={showReverseRecModal}
              onClose={() => setShowReverseRecModal(false)}
              recommendations={recommendations}
              users={users}
              selectedUser={selectedUser}
              title={"Recommended Tracks"}
              subtitle={users.find(u => u._id === selectedUser)?.username ? `from ${users.find(u => u._id === selectedUser)?.username} to you` : undefined}
            />
          </>
        )}
      </div>
    </div>
  );
}
