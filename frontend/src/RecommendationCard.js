import React, { useState, useEffect } from 'react';
import './RecommendationCard.css';
import API_URL from './api';

export default function RecommendationCard({ rec, musilikedIds, onLikeToggle, onHide, hidden }) {
  // Reaction state for recipient
  const [reactionEmoji, setReactionEmoji] = useState('');
  const [reactionText, setReactionText] = useState('');
  const [currentReaction, setCurrentReaction] = useState(rec.reaction && (rec.reaction.emoji || rec.reaction.text) ? rec.reaction : null);

  useEffect(() => {
    if (rec.reaction && (rec.reaction.emoji || rec.reaction.text)) {
      setCurrentReaction(rec.reaction);
    }
  }, [rec.reaction]);

  const handleSendReaction = async () => {
    if (!reactionEmoji && !reactionText) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to react.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/recommendation/${rec._id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ emoji: reactionEmoji, text: reactionText })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentReaction(data.reaction);
      } else {
        const errData = await res.json();
        alert('Failed to send reaction: ' + (errData.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error');
    }
  };
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folded, setFolded] = useState(false);

  useEffect(() => {
    setIsLiked(musilikedIds.includes(rec.track?.id));
  }, [musilikedIds, rec.track]);

  const handleLike = async () => {
    if (!rec.track) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (!isLiked) {
        // Like
        const res = await fetch(`${API_URL}/api/musiliked`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
          body: JSON.stringify({
            trackId: rec.track.id,
            trackName: rec.track.name,
            artists: rec.track.artists,
            albumName: rec.track.album?.name,
            albumImage: rec.track.album?.images?.[0]?.url,
            spotifyUrl: rec.track.external_urls?.spotify,
            rawTrack: rec.track,
          })
        });
        if (res.ok) {
          setIsLiked(true);
          onLikeToggle && onLikeToggle(rec.track.id, true);
        }
      } else {
        // Unlike
        const res = await fetch(`${API_URL}/api/musiliked/${rec.track.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
          }
        });
        if (res.ok) {
          setIsLiked(false);
          onLikeToggle && onLikeToggle(rec.track.id, false);
        }
      }
    } catch (err) {
      // Optionally handle error
    }
    setLoading(false);
  };

  if (hidden && !folded) {
    // Animate fold-out
    setFolded(true);
    setTimeout(() => onHide && onHide(rec._id), 400); // Remove from DOM after animation
    return (
      <li className="inbox-item fold-out" style={{ height: 0, opacity: 0, transition: 'all 0.4s' }}></li>
    );
  }
  if (folded) return null;

  return (
    <li className={`inbox-item${folded ? ' fold-out' : ''}`}>
      <div className="rec-card-top" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        <div className="rec-card-player">
          <iframe
            src={`https://open.spotify.com/embed/track/${rec.track?.id}`}
            width="280"
            height="80"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
            title="Spotify Player"
            style={{ borderRadius: 8 }}
          ></iframe>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
          <button
            className={`like-btn ${isLiked ? 'liked' : 'unliked'}`}
            title={isLiked ? 'Remove Musi-Like' : 'Musi-Like this song!'}
            disabled={loading}
            onClick={async () => {
              if (!rec.track) return;
              setLoading(true);
              const token = localStorage.getItem('token');
              try {
                if (!isLiked) {
                  // Like
                  const res = await fetch(`${API_URL}/api/musiliked`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                      trackId: rec.track.id,
                      trackName: rec.track.name,
                      artists: rec.track.artists ? rec.track.artists.map(a => a.name) : [],
                      albumName: rec.track.album ? rec.track.album.name : '',
                      albumImage: rec.track.album && rec.track.album.images && rec.track.album.images[0] ? rec.track.album.images[0].url : '',
                      spotifyUrl: rec.track.external_urls ? rec.track.external_urls.spotify : '',
                      rawTrack: rec.track,
                    })
                  });
                  if (res.ok) {
                    setIsLiked(true);
                    onLikeToggle && onLikeToggle(rec.track.id, true);
                  } else {
                    const data = await res.json();
                    alert('Error: ' + (data.error || 'Could not like track.'));
                  }
                } else {
                  // Unlike
                  const res = await fetch(`${API_URL}/api/musiliked/${rec.track.id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': 'Bearer ' + token,
                    },
                  });
                  if (res.ok) {
                    setIsLiked(false);
                    onLikeToggle && onLikeToggle(rec.track.id, false);
                  } else {
                    const data = await res.json();
                    if (res.status === 404) {
                      setIsLiked(false);
                      onLikeToggle && onLikeToggle(rec.track.id, false);
                    } else {
                      alert('Error: ' + (data.error || 'Could not unlike track.'));
                    }
                  }
                }
              } catch (err) {
                alert('Network error.');
              }
              setLoading(false);
            }}
          >
            <span role="img" aria-label="thumb up">👍</span> <span style={{ fontSize: '0.75em' }}>{isLiked ? 'Musi-Liked' : 'Musi-Like'}</span>
          </button>
          {/* Trash button below Musi-Like */}
          <button
            className="trash-btn"
            title="Hide this recommendation"
            style={{ marginTop: 10, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
            onClick={async () => {
              setFolded(true);
              setTimeout(() => onHide && onHide(rec._id), 400); // Remove from DOM after animation
              const token = localStorage.getItem('token');
              await fetch('/api/hidden-recommendation', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ recommendationId: rec._id })
              });
            }}
          >
            <span role="img" aria-label="trash">🗑️</span> <span style={{ fontSize: '0.75em' }}>Hide</span>
          </button>
        </div>
      </div>
      <div className="rec-card-meta">
        From: <b>{rec.fromUser?.username || 'Unknown'}</b> ({rec.fromUser?.email || ''}) {new Date(rec.createdAt).toLocaleString()}
      </div>
      <div className="rec-card-message-bubble">
        <div className="rec-card-message-text">{rec.message}</div>
      </div>
      {/* Reaction UI for recipient */}
      <div className="rec-card-reaction-box" style={{ marginTop: 12, padding: 8, borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fafbfc', borderRadius: 12 }}>
        {currentReaction ? (
          <div style={{ marginTop: 2, fontSize: '1.1em', color: '#444' }}>
            <span>Reaction sent: </span>
            <span style={{ fontSize: 22 }}>{currentReaction.emoji}</span>
            {currentReaction.text && (
              <span style={{ marginLeft: 8, fontStyle: 'italic', color: '#888' }}>
                "{currentReaction.text}"
              </span>
            )}
          </div>
        ) : (
          <>
            <div style={{ fontSize: '0.95em', marginBottom: 4, color: '#888' }}>React to this message:</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {['👍','❤️','😂','🎵','🔥','🙏'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className="reaction-emoji-btn"
                  style={{
                    fontSize: 22,
                    background: reactionEmoji === emoji ? '#e0ffe6' : 'none',
                    border: reactionEmoji === emoji ? '2px solid #27ae60' : 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    opacity: reactionEmoji && reactionEmoji !== emoji ? 0.4 : 1,
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setReactionEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              maxLength={60}
              placeholder="Add a short message (optional)"
              style={{ padding: 4, borderRadius: 5, border: '1px solid #ddd', marginBottom: 8, width: '80%' }}
              value={reactionText}
              onChange={e => setReactionText(e.target.value)}
            />
            <button
              className="send-reaction-btn"
              style={{ background: '#27ae60', color: 'white', border: 'none', borderRadius: 5, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95em' }}
              onClick={handleSendReaction}
            >
              Send Reaction
            </button>
          </>
        )}
      </div>
    </li>
  );
}
