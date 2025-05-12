import React, { useState } from 'react';
import MusilikeButton from './MusilikeButton';
import API_URL from './api';

export default function SpotifyTrackWithActions({ track, musilikedIds, refreshMusilikedIds, onRecommend, showRecommend, style, toUserId }) {
  const [showMsg, setShowMsg] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Slide-down message area styles
  const msgAreaStyle = {
    maxHeight: showMsg ? 200 : 0,
    opacity: showMsg ? 1 : 0,
    overflow: 'hidden',
    transition: 'all 0.33s cubic-bezier(0.4,0,0.2,1)',
    marginTop: showMsg ? 12 : 0,
    background: '#fffbe8',
    borderRadius: 10,
    boxShadow: showMsg ? '0 2px 12px #ffe08255' : 'none',
    padding: showMsg ? '16px 16px 12px 16px' : '0 16px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const handleSend = async () => {
    if (!toUserId || !track || !track.id) {
      console.error('[handleSend] BLOCKED: Missing toUserId or track:', { toUserId, track });
      setError('Missing recipient or track.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('[handleSend] toUserId:', toUserId);
      console.log('[handleSend] track:', track);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          toUserId,
          message,
          track,
        }),
      });
      if (res.ok) {
        setSent(true);
        setMessage('');
        if (typeof onRecommend === 'function') {
          onRecommend();
        }
        setTimeout(() => {
          setShowMsg(false);
          setSent(false);
        }, 1800);
      } else {
        const data = await res.json();
        setError(data.error || 'Could not send recommendation.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', ...style }}>
      {track.id && (
        <div className="spotify-embed-player">
          <iframe
            src={`https://open.spotify.com/embed/track/${track.id}`}
            width="280"
            height="80"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
            title={`Spotify Player for ${track.name}`}
            style={{ borderRadius: 8 }}
          />
        </div>
      )}
      <div className="spotify-search-result-actions" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 10, width: '100%' }}>
        {showRecommend && (
          <>
            <button
              className="recommend-btn"
              title="Recommend this song!"
              onClick={() => setShowMsg(v => !v)}
              style={{ width: 130, height: 30, maxWidth: '90vw' }}
              disabled={sent}
            >
              <span role="img" aria-label="music">🎵</span> <span style={{ fontSize: '0.95em', fontWeight: 600 }}>Recommend!</span>
            </button>
          </>
        )}
        <MusilikeButton
          track={track}
          musilikedIds={musilikedIds}
          refreshMusilikedIds={refreshMusilikedIds}
          style={{ width: 160, height: 10, maxWidth: '90vw' }}
        />
      </div>
      {/* Inline recommend message area */}
      <div style={msgAreaStyle}>
        {showMsg && (
          <>
            {sent ? (
              <div style={{ color: '#159b42', fontWeight: 600, fontSize: 17, margin: '10px 0' }}>Recommendation sent!</div>
            ) : (
              <>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Check out this song, it’s one of my favorite!"
                  rows={3}
                  style={{ width: '96%', borderRadius: 8, border: '1px solid #dbb77b', padding: 8, fontSize: 16, marginBottom: 10, resize: 'none', background: '#fff' }}
                  disabled={loading}
                />
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8, marginTop: 2, marginBottom: 2 }}>
                  <button
                    className="recommend-btn"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: 17,
                      fontWeight: 700,
                      padding: '8px 0',
                      borderRadius: 7,
                      background: '#DBB77B',
                      color: '#fff',
                      letterSpacing: 0.1,
                      transition: 'background 0.16s',
                      border: 'none',
                      outline: 'none',
                      cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                      minHeight: 38,
                      minWidth: 0,
                    }}
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    aria-label="Close message area"
                    title="Close"
                    onClick={() => setShowMsg(false)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: '#eee',
                      border: 'none',
                      color: '#888',
                      fontSize: 22,
                      fontWeight: 700,
                      marginLeft: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'background 0.18s',
                    }}
                  >
                    ×
                  </button>
                </div>
                {error && <div style={{ color: '#d32f2f', fontWeight: 500, marginTop: 6 }}>{error}</div>}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

