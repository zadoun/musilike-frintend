import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';

export default function MusicProfile() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError('Please log in to view your music profile.');
    fetch('/api/musiliked', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load your Musi-Liked tracks.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="music-profile-loading">Loading...</div>;
  if (error) return <div className="music-profile-error">{error}</div>;

  return (
    <div className="music-profile-container">
      <h2 className="music-profile-title">Your Musi-Liked Tracks</h2>
      {tracks.length === 0 ? (
        <div className="music-profile-empty">You haven't Musi-Liked any tracks yet.</div>
      ) : (
        <ul className="music-profile-list">
          {tracks.map((t, i) => (
            <li key={t._id || t.trackId} className="music-profile-track">
              <div className="music-profile-index">{i + 1}</div>
              <img className="music-profile-album" src={t.albumImage} alt={t.albumName} />
              <div className="music-profile-info">
                <div className="music-profile-trackname">{t.trackName}</div>
                <div className="music-profile-artist">{t.artists && t.artists.join(', ')}</div>
                <div className="music-profile-albumname">{t.albumName}</div>
              </div>
              <a href={t.spotifyUrl} target="_blank" rel="noopener noreferrer" className="music-profile-play-btn" title="Play on Spotify">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="11" fill="none"/>
                  <polygon points="8,6 16,11 8,16" fill="#fff"/>
                </svg>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
