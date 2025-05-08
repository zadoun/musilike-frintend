import React, { useState } from 'react';
import API_URL from './api';

export default function MusilikeButton({ track, musilikedIds = [], refreshMusilikedIds }) {
  const [loading, setLoading] = useState(false);
  const isMusiliked = musilikedIds.includes(track.id);

  const handleToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in.');
      setLoading(false);
      return;
    }
    const method = isMusiliked ? 'DELETE' : 'POST';
    const url = `${API_URL}/api/musiliked${isMusiliked ? `/${track.id}` : ''}`;
    const body = isMusiliked ? undefined : JSON.stringify({
      trackId: track.id,
      trackName: track.name,
      artists: track.artists.map(a => a.name),
      albumName: track.album?.name,
      albumImage: track.album?.images?.[0]?.url,
      spotifyUrl: track.external_urls?.spotify
    });
    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body
      });
      refreshMusilikedIds && refreshMusilikedIds();
    } catch (err) {
      alert('Could not update Musi-Like.');
    }
    setLoading(false);
  };

  return (
    <button
      className={`like-btn ${isMusiliked ? 'liked' : 'unliked'}`}
      disabled={loading}
      onClick={handleToggle}
      title={isMusiliked ? 'Remove Musi-Like' : 'Musi-Like this song!'}
      style={{marginLeft: 8}}
    >
    🎵 {isMusiliked ? 'Liked !' : 'Like that !'}
    </button>
  );
}
