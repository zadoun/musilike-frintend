import React from 'react';
import SpotifyTrackWithActions from './SpotifyTrackWithActions';

export default function RecommendationsModal({ open, onClose, recommendations, title, subtitle, recipientId }) {
  const [musilikedIds, setMusilikedIds] = React.useState([]);

  // Fetch Musi-Liked track IDs when modal opens
  React.useEffect(() => {
    if (!open) return;
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

  if (!open || !recommendations || recommendations.length === 0) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.37)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '34px 32px 24px 32px', minWidth: 350, maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.13)', position: 'relative', color: '#111'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#1db954' }}>×</button>
        <h2 style={{ marginTop: 0, marginBottom: 18, textAlign: 'center', color: '#1db954', fontWeight: 700, fontSize: 24 }}>
          {title || 'Recommended Tracks'}
        </h2>
        {subtitle && (
          <div style={{ fontSize: 28, fontWeight: 500, marginBottom: 14, textAlign: 'center', color: '#111' }}>{subtitle}</div>
        )}
        <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
          {recommendations.slice(0, 10).map(t => {
            let toUserId = recipientId || t.toUserId || t.userId || t.recipientId;
            const canSend = !!toUserId;
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
                  showRecommend={canSend}
                  toUserId={toUserId}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
