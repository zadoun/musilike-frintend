import React from 'react';

export default function RecommendationsModal({ open, onClose, recommendations, title, subtitle }) {
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
          <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 14, textAlign: 'center', color: '#111' }}>{subtitle}</div>
        )}
        <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
          {recommendations.slice(0, 20).map(t => (
            <li key={t.trackId} style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>{t.trackName}</span> {t.artists && (<span style={{ color: '#111', fontSize: '0.97em' }}>({(t.artists||[]).join(', ')})</span>)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
