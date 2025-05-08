import React from 'react';

export default function CompatibilityModal({ open, onClose, result, users, selectedUser, recommendations }) {
  if (!open || !result) return null;
  const selectedUserObj = users.find(u => u._id === selectedUser);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.37)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
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
          <div><b>Tracks:</b> {result.count.sharedTracks} shared</div>
          <div><b>Artists:</b> {result.count.sharedArtists} shared</div>
          <div><b>Genres:</b> {result.count.sharedGenres} shared</div>
          <div style={{ color: '#111', marginTop: 6, fontSize: 15 }}>
            <small>Weights: Track {Math.round(result.scores.weights.track*100)}% | Artist {Math.round(result.scores.weights.artist*100)}% | Genre {Math.round(result.scores.weights.genre*100)}%</small>
          </div>
        </div>
        <div style={{ marginBottom: 14, color: '#111' }}>
          <b>Shared Tracks:</b>
          <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
            {result.sharedTracks.map(t => (
              <li key={t.trackId} style={{ marginBottom: 2 }}>{t.trackName} {t.artists && (<span style={{ color: '#111', fontSize: '0.97em' }}>({(t.artists||[]).join(', ')})</span>)}</li>
            ))}
          </ul>
        </div>
        <div style={{ marginBottom: 14, color: '#111' }}>
          <b>Shared Artists:</b> {result.sharedArtists.join(', ')}
        </div>
        <div style={{ color: '#111' }}>
          <b>Shared Genres:</b> {result.sharedGenres.join(', ')}
        </div>
        {/* Recommended Tracks */}
        {recommendations && recommendations.length > 0 && (
          <div style={{ marginTop: 22, color: '#111' }}>
            <b>Recommended Tracks:</b>
            <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
              {recommendations.slice(0, 10).map(t => (
                <li key={t.trackId} style={{ marginBottom: 2 }}>{t.trackName} {t.artists && (<span style={{ color: '#111', fontSize: '0.97em' }}>({(t.artists||[]).join(', ')})</span>)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
