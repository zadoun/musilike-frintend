import React, { useState, useEffect } from 'react';
import SpotifyTrackWithActions from './SpotifyTrackWithActions';

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
        <div style={{ background: '#fff', borderRadius: 12, padding: '34px 32px 24px 32px', minWidth: 350, maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.13)', position: 'relative', color: '#111' }}>
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

  // Prepare shared liked recommendations lists if present
  const sharedRecommendedLikedAtoB = result.sharedRecommendedLikedAtoB || [];
  const sharedRecommendedLikedBtoA = result.sharedRecommendedLikedBtoA || [];

  return (
    <div>
      <div className="compatibility-modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.51)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff', borderRadius: 12, padding: '34px 32px 24px 32px', minWidth: 350, maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.13)', position: 'relative'
        }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#1db954' }}>×</button>
          <h2 style={{ marginTop: 0, marginBottom: 18, textAlign: 'center', color: '#1db954', fontWeight: 700, fontSize: 24 }}>
            Compatibility Details
          </h2>
          <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 14, textAlign: 'center', color: '#111' }}>
            {selectedUserObj?.username && (<span>with <span style={{ color: '#1db954' }}>{selectedUserObj.username}</span></span>)}
          </div>
          <div style={{ marginBottom: 16, color: '#111' }}>
            <div style={{ color: '#111', marginBottom: 14 }}>
              <b>Shared Genres:</b> {sharedProfileGenres.join(', ')}
            </div>
            <div style={{ marginBottom: 14, color: '#111' }}>
              <b>Shared Artists:</b> {sharedTrackArtists.join(', ')}
            </div>
            {(sharedRecommendedLikedAtoB.length > 0 || sharedRecommendedLikedBtoA.length > 0) && (
              <div style={{ marginTop: 10, color: '#111' }}>
                <b>Liked Recommendations:</b>
                {sharedRecommendedLikedAtoB.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: '#1db954' }}>From you to {selectedUserObj?.username}:</span>
                    <ul style={{ margin: '2px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
                      {sharedRecommendedLikedAtoB.map(t => (
                        <li key={t.trackId || t._id} style={{ marginBottom: 2 }}>{t.trackName || t.trackId} {t.artists && (<span style={{ color: '#111', fontSize: '0.97em' }}>({(t.artists||[]).join(', ')})</span>)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {sharedRecommendedLikedBtoA.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: '#1db954' }}>From {selectedUserObj?.username} to you:</span>
                    <ul style={{ margin: '2px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
                      {sharedRecommendedLikedBtoA.map(t => (
                        <li key={t.trackId || t._id} style={{ marginBottom: 2 }}>{t.trackName || t.trackId} {t.artists && (<span style={{ color: '#111', fontSize: '0.97em' }}>({(t.artists||[]).join(', ')})</span>)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
