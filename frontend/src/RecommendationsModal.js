import React from 'react';
import SpotifyTrackWithActions from './SpotifyTrackWithActions';

import { useSentRecommendations } from './hooks';

export default function RecommendationsModal({ open, onClose, recommendations, title, subtitle, recipientId }) {
  const [locallySent, setLocallySent] = React.useState([]);
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

  // Fetch sent recommendations for the recipient
  const { sentTrackIds, loading: sentLoading } = useSentRecommendations(recipientId);

  // Filter out tracks already recommended
  const filteredRecs = React.useMemo(() => {
    if (!recommendations) return [];
    let recs = recommendations;
    if (sentTrackIds && sentTrackIds.length > 0) {
      recs = recs.filter(t => !sentTrackIds.includes(t.trackId || t.id));
    }
    if (locallySent && locallySent.length > 0) {
      recs = recs.filter(t => !locallySent.includes(t.trackId || t.id));
    }
    return recs;
  }, [recommendations, sentTrackIds, locallySent]);

  if (!open || !recommendations || recommendations.length === 0) return null;
  if (sentLoading) return <div style={{color:'#888',padding:24}}>Loading recommendations...</div>;
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
          {filteredRecs.length === 0 && (
            <li style={{ color: '#888', padding: '18px 0', textAlign: 'center' }}>No new tracks to recommend to this user.</li>
          )}
          {filteredRecs.slice(0, 10).map(t => {
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
                  onRecommend={() => setLocallySent(prev => ([...(prev || []), t.trackId || t.id]))}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
