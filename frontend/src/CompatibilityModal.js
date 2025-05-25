import React, { useState, useEffect } from 'react';
import SpotifyTrackWithActions from './SpotifyTrackWithActions';
import RadarCompatibilityChart from './RadarCompatibilityChart';
// The badge icon for the compatibility score
// (SVG import used via require to support dynamic usage in img tag)


export default function CompatibilityModal({ open, onClose, result, users, selectedUser, recommendations, title, subtitle }) {
  // Debug logging for recommendations direction
  React.useEffect(() => {
    if (result) {
      console.log('[CompatibilityModal] sharedRecommendedLikedAtoB:', result.sharedRecommendedLikedAtoB);
      console.log('[CompatibilityModal] sharedRecommendedLikedBtoA:', result.sharedRecommendedLikedBtoA);
    }
  }, [result]);

  const [musilikedIds, setMusilikedIds] = useState([]);

  // Fetch Musi-Liked track IDs on mount
  useEffect(() => {
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
  }, [open]);

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

  if (!open) return null;

  // If opened for recommendations only (no result), show only recommendations with title/subtitle
  if (!result && recommendations && recommendations.length > 0) {
    return (
      <div className="compatibility-modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.51)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '34px 32px 24px 32px', minWidth: 350, maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.13)', position: 'relative', color: '#111', width: '100%' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#1db954' }}>×</button>
          <h2 style={{ marginTop: 0, marginBottom: 18, textAlign: 'center', color: '#1db954', fontWeight: 700, fontSize: 24 }}>
            {title || 'Recommended Tracks'}
          </h2>
          {subtitle && (
            <div style={{ fontSize: 28, fontWeight: 500, marginBottom: 14, textAlign: 'center', color: '#111' }}>{subtitle}</div>
          )}
          <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
            {recommendations.slice(0, 10).map(t => {
              let recipientId = selectedUser;
              if (!recipientId) {
                recipientId = t.toUserId || t.userId || t.recipientId;
                console.log('[CompatibilityModal] Fallback recipientId from recommendation (modal-only):', recipientId);
              }
              const canSend = !!recipientId;
              return (
                <li key={t.trackId} style={{ marginBottom: 18 }}>
                  {!canSend && (
                    <div style={{ color: 'red', marginBottom: 6, fontSize: 14 }}>
                      Cannot send recommendation: recipient unknown.
                    </div>
                  )}
                  <SpotifyTrackWithActions
                    track={{
                      id: t.trackId,
                      name: t.trackName,
                      artists: (t.artists || []).map(a => ({ name: a })),
                      album: t.albumName ? { name: t.albumName, images: [{ url: t.albumImage }] } : undefined,
                      external_urls: t.spotifyUrl ? { spotify: t.spotifyUrl } : undefined
                    }}
                    musilikedIds={musilikedIds}
                    refreshMusilikedIds={refreshMusiliked}
                    showRecommend={false}
                    toUserId={recipientId}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  // Defensive: allow modal to open even if result is temporarily missing
  if (!result) {
    return null;
  }

  const selectedUserObj = users.find(u => u._id === selectedUser);

  // Defensive checks for flexible backend fields
  const count = result.count || {};
  const scores = result.scores || {};
  const weights = scores.weights || {};

  // Shared items: flexible for new backend structure
  const sharedTrackIds = result.sharedTrackIds || [];
  const sharedTrackArtists = result.sharedTrackArtists || [];
  const sharedTrackGenres = result.sharedTrackGenres || [];
  const sharedProfileArtists = result.sharedProfileArtists || [];
  const sharedProfileGenres = result.sharedProfileGenres || [];

  // Prepare shared liked recommendations lists if present (now handled below)

  // Compute directional liked recommendation percentages
  const totalRecsAToB = (result.count?.totalRecommendationsExchanged || 0) > 0
    ? (result.count?.totalRecommendationsExchanged || 0) / 2
    : 0;
  const totalRecsBToA = totalRecsAToB; // Assume symmetry; adjust if you have separate counts
  const sharedRecommendedLikedAtoB = result.sharedRecommendedLikedAtoB || [];
  const sharedRecommendedLikedBtoA = result.sharedRecommendedLikedBtoA || [];
  // Defensive: avoid 0 division
  const sharedRecommendationLikedPercentA = totalRecsBToA > 0 ? sharedRecommendedLikedBtoA.length / totalRecsBToA : 0;
  const sharedRecommendationLikedPercentB = totalRecsAToB > 0 ? sharedRecommendedLikedAtoB.length / totalRecsAToB : 0;

  return (
    <div>
      <div className="compatibility-modal-overlay" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.51)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="compat-card" style={{position: 'relative', width: '100%', maxWidth: 440, padding: 0, borderRadius: 22, background: 'linear-gradient(180deg, #061024 0%, #292733 100%)'}}>
          <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#FFF2CC', zIndex: 2 }}>×</button>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 36, marginBottom: 0, padding: '0 32px'}}>
            <span style={{fontSize: 28, color: '#E7D3A1', fontWeight: 500}}>You</span>
            <img src={require('./CompatibilityBadge.svg').default} alt="compat badge" style={{ width: 44, height: 44, margin: '0 0 0 0' }} />
            <span style={{fontSize: 28, color: '#E7D3A1', fontWeight: 500}}>{selectedUserObj?.username || 'Other'}</span>
          </div>
          <div style={{textAlign: 'center', margin: '8px 0 0 0', color: '#E7D3A1', fontWeight: 700, fontSize: 36, letterSpacing: 0.5}}>
            {Math.round(((result?.score ?? result?.scores?.weightedScore ?? 0) * 100))}%
          </div>
          <div style={{textAlign: 'center', color: '#E7D3A1', fontWeight: 400, fontSize: 22, marginBottom: 10, marginTop: 2, fontFamily: 'Georgia,serif'}}>compatible</div>
          <div style={{margin: '0 auto 42px auto', width: '96%', minHeight: 260}}>
            <RadarCompatibilityChart
              userAName="You"
              userBName={selectedUserObj?.username || 'Other'}
              data={[
                { metric: 'Genres', you: (scores.trackGenreScorePercentA ?? 0) * 100, other: (scores.trackGenreScorePercentB ?? 0) * 100 },
                { metric: 'Artists', you: (scores.trackArtistScorePercentA ?? 0) * 100, other: (scores.trackArtistScorePercentB ?? 0) * 100 },
                { metric: 'Tracks', you: (scores.trackScorePercentA ?? 0) * 100, other: (scores.trackScorePercentB ?? 0) * 100 },
                { metric: 'Liked Recs', you: sharedRecommendationLikedPercentA * 100, other: sharedRecommendationLikedPercentB * 100 },
              ]}
            />
          </div>
          <div style={{margin: '0 0 0 0', padding: '0 32px'}}>
            <div style={{color: '#E7D3A1', fontWeight: 600, fontSize: 28, margin: '0 0 6px 0'}}>Shared Genres</div>
            <div className="compat-shared-list">{sharedProfileGenres.length ? sharedProfileGenres.join(' - ') : <span className="compat-shared-list-none">None</span>}</div>
            <div style={{color: '#E7D3A1', fontWeight: 600, fontSize: 28, margin: '0 0 6px 0'}}>Shared Artists</div>
            <div className="compat-shared-list">{sharedTrackArtists.length ? sharedTrackArtists.join(' - ') : <span className="compat-shared-list-none">None</span>}</div>
            <div style={{color: '#E7D3A1', fontWeight: 600, fontSize: 28, margin: '0 0 6px 0'}}>Shared Tracks</div>
            <div className="compat-shared-list">{
  sharedTrackIds.length
    ? sharedTrackIds.map((t, i) => {
        // Try to get the track name from result.sharedTrackNames, or from result.sharedTracks if present
        let trackName = (result.sharedTrackNames && result.sharedTrackNames[i])
          || (result.sharedTracks && result.sharedTracks[i] && (result.sharedTracks[i].trackName || result.sharedTracks[i].name))
          || t;
        return <div key={t}>{trackName}</div>;
      })
    : <span style={{color:'#7c7c7c', fontSize:18}}>None</span>
}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
