import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';
import MusilikeButton from './MusilikeButton';

export default function MusicProfile({ musilikedRefreshFlag }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError('Please log in to view your music profile.');
    fetch(`${API_URL}/api/musiliked`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setTracks(data.tracks || []);
        console.log('Musi-Liked tracks from backend:', data.tracks);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not fetch your Musi-Liked tracks');
        setLoading(false);
      });
  }, [musilikedRefreshFlag]);

  // No longer needed: refreshMusilikedIds and musilikedIds state


  if (loading) return <div className="music-profile-loading">Loading...</div>;
  if (error) return <div className="music-profile-error">{error}</div>;

  return (
    <div className="music-profile-container">
      <h2 className="music-profile-title">Your Musi-Liked Tracks</h2>
      {tracks.length === 0 ? (
        <div className="music-profile-empty">You haven't Musi-Liked any tracks yet.</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '0'}}>
          {[...tracks].reverse().map(track => (
            <div
              key={track.trackId || track.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8f9fa',
                borderRadius: 8,
                padding: '8px 18px',
                minWidth: 0,
                marginBottom: 10,
                borderBottom: '1px solid #e0e0e0',
                fontWeight: 500,
                maxWidth: 900,
                width: '100%',
                boxSizing: 'border-box',
                transition: 'background 0.15s',
              }}
            >
              {/* Album image */}
              <img
                src={track.albumImage || 'https://via.placeholder.com/48?text=%20'}
                alt={track.albumName || 'No album'}
                style={{width: 48, height: 48, objectFit: 'cover', borderRadius: 6, marginRight: 16, background: '#eee', flexShrink: 0}}
              />
              {/* Track info */}
              <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <span style={{
                  fontSize: 22,
                  color: '#222',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                }}>{track.trackName || track.name}</span>
                <span style={{
                  fontSize: 16,
                  color: '#666',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                }}>{track.artistName || (Array.isArray(track.artists) ? track.artists.map(a => a.name).join(', ') : '')}
                  {track.albumName ? <span style={{margin: '0 6px', color: '#bbb'}}>&#183;</span> : null}
                  {track.albumName ? <span style={{color: '#888'}}>{track.albumName}</span> : null}
                </span>
              </div>

              {/* Spotify Play Button */}
              {track.spotifyUrl && (
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: 24,
                    marginRight: 16,
                    color: '#1DB954',
                    fontWeight: 700,
                    fontSize: 20,
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 80,
                    borderRadius: 12,
                    padding: '6px 18px',
                    background: '#fff',
                    boxSizing: 'border-box',
                    transition: 'border 0.15s, box-shadow 0.15s',
                    boxShadow: '0 1px 6px rgba(30,185,84,0.08)'
                  }}
                  title="Play on Spotify"
                  onClick={e => e.stopPropagation()}
                >
                  <span
                    aria-label="Spotify"
                    style={{
                      background: '#1DB954',
                      borderRadius: '50%',
                      width: 44,
                      height: 44,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 4px auto',
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="4,2 14,8 4,14" />
                    </svg>
                  </span>
                  <span style={{fontSize: 16, color: '#1DB954', fontWeight: 700, letterSpacing: 0.5, marginTop: 0}}>Spotify</span>
                </a>
              )}

              {/* Sender box */}
              {track.fromUser && track.fromUser.username && (
                <div style={{
                  marginLeft: 8,
                  minWidth: 90,
                  background: '#49536a',
                  color: '#ffc857',
                  borderRadius: 11,
                  fontWeight: 700,
                  fontSize: 17,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 18px',
                  height: 56,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                }}>
                  <span style={{fontSize: 15, color: '#e6e6e6', fontWeight: 500, marginBottom: 2}}>From</span>
                  <span style={{color: '#ffc857', fontWeight: 700, fontSize: 18}}>{track.fromUser.username}</span>
                </div>
              )}
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
