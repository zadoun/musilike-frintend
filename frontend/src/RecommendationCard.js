import React, { useState, useEffect } from 'react';

export default function RecommendationCard({ rec, musilikedIds, onLikeToggle }) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

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
        const res = await fetch('/api/musiliked', {
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
        const res = await fetch(`/api/musiliked/${rec.track.id}`, {
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

  return (
    <li className="inbox-item">

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
                  const res = await fetch('/api/musiliked', {
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
                  const res = await fetch(`/api/musiliked/${rec.track.id}`, {
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
        </div>
      </div>
      <div className="rec-card-meta">
        From: <b>{rec.fromUser?.username || 'Unknown'}</b> ({rec.fromUser?.email || ''}) {new Date(rec.createdAt).toLocaleString()}
      </div>
      <div className="rec-card-message-bubble">
        <div className="rec-card-message-text">{rec.message}</div>
      </div>
    </li>
  );
}
