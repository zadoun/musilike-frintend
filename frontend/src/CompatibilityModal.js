import React, { useState, useEffect } from 'react';
import SpotifyTrackWithActions from './SpotifyTrackWithActions';

export default function CompatibilityModal({ open, onClose, result, users, selectedUser, recommendations, title, subtitle }) {
  // Debug logging for recommendations direction
  React.useEffect(() => {
    if (result) {
      console.log('[CompatibilityModal] sharedRecommendedLikedAtoB:', result.sharedRecommendedLikedAtoB);
      console.log('[CompatibilityModal] sharedRecommendedLikedBtoA:', result.sharedRecommendedLikedBtoA);
    }
  }, [result]);

  const [musilikedIds, setMusilikedIds] = useState([]);

  // Fetch Musi-Liked track IDs on mount
  useEffect(() => {
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

  if (!open) return null;

  // If opened for recommendations only (no result), show only recommendations with title/subtitle
  if (!result && recommendations && recommendations.length > 0) {
    return (
      <div className="compatibility-modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.51)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '34px 32px 24px 32px', minWidth: 350, maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.13)', position: 'relative', color: '#111' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#1db954' }}>×</button>
          <h2 style={{ marginTop: 0, marginBottom: 18, textAlign: 'center', color: '#1db954', fontWeight: 700, fontSize: 24 }}>
            {title || 'Recommended Tracks'}
          </h2>
          {subtitle && (
            <div style={{ fontSize: 28, fontWeight: 500, marginBottom: 14, textAlign: 'center', color: '#111' }}>{subtitle}</div>
          )}
          <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
            {recommendations.slice(0, 10).map(t => (
              <li key={t.trackId} style={{ marginBottom: 18 }}>
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
                  showRecommend={true}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  // Defensive: allow modal to open even if result is temporarily missing
  if (!result) {
    return null;
  }
  const selectedUserObj = users.find(u => u._id === selectedUser);

  // Defensive checks for flexible backend fields
  const count = result.count || {};
  const scores = result.scores || {};
  const weights = scores.weights || {};

  // Shared items: flexible for new backend structure
  const sharedTrackIds = result.sharedTrackIds || [];
  const sharedTrackArtists = result.sharedTrackArtists || [];
  const sharedTrackGenres = result.sharedTrackGenres || [];
  const sharedProfileArtists = result.sharedProfileArtists || [];
  const sharedProfileGenres = result.sharedProfileGenres || [];

  // Prepare shared liked recommendations lists if present
  const sharedRecommendedLikedAtoB = result.sharedRecommendedLikedAtoB || [];
  const sharedRecommendedLikedBtoA = result.sharedRecommendedLikedBtoA || [];
  return (
    <div className="compatibility-modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.51)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
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
          <div><b>Tracks:</b> {count.sharedTracks ?? sharedTrackIds.length} shared</div>
          <div><b>Track Artists:</b> {count.sharedTrackArtists ?? sharedTrackArtists.length} shared</div>
          <div><b>Track Genres:</b> {count.sharedTrackGenres ?? sharedTrackGenres.length} shared</div>
          <div><b>Profile Artists:</b> {count.sharedProfileArtists ?? sharedProfileArtists.length} shared</div>
          <div><b>Profile Genres:</b> {count.sharedProfileGenres ?? sharedProfileGenres.length} shared</div>
          <div style={{ color: '#111', marginTop: 6, fontSize: 15 }}>
            <small>
              Weights: Track {Math.round((weights.track||0)*100)}% | TrackArtist {Math.round((weights.trackArtist||0)*100)}% | TrackGenre {Math.round((weights.trackGenre||0)*100)}% | ProfileArtist {Math.round((weights.profileArtist||0)*100)}% | ProfileGenre {Math.round((weights.profileGenre||0)*100)}% | SharedRecLiked {Math.round((weights.sharedRecommendationLiked||0)*100)}%
            </small>
          </div>
          {/* Shared Recommendation Liked Score */}
          {scores && typeof scores.sharedRecommendationLikedScore === 'number' && (
            <div style={{ color: '#1db954', marginTop: 3, fontSize: 15 }}>
              <small>
                <b>Shared Liked Recommendations Score:</b> {(scores.sharedRecommendationLikedScore * 100).toFixed(1)}%
              </small>
            </div>
          )}
          {/* Shared Recommendations Liked Lists */}
          {(sharedRecommendedLikedAtoB.length > 0 || sharedRecommendedLikedBtoA.length > 0) && (
            <div style={{ marginTop: 10, color: '#111' }}>
              <b>Liked Recommendations:</b>
              {sharedRecommendedLikedAtoB.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <span style={{ color: '#1db954' }}>From you to {selectedUserObj?.username}:</span>
                  <ul style={{ margin: '2px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
                    {sharedRecommendedLikedAtoB.map(t => (
                      <li key={t.trackId || t._id} style={{ marginBottom: 2 }}>{t.trackName || t.trackId} {t.artists && (<span style={{ color: '#111', fontSize: '0.97em' }}>({(t.artists||[]).join(', ')})</span>)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sharedRecommendedLikedBtoA.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <span style={{ color: '#1db954' }}>From {selectedUserObj?.username} to you:</span>
                  <ul style={{ margin: '2px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
                    {sharedRecommendedLikedBtoA.map(t => (
                      <li key={t.trackId || t._id} style={{ marginBottom: 2 }}>{t.trackName || t.trackId} {t.artists && (<span style={{ color: '#111', fontSize: '0.97em' }}>({(t.artists||[]).join(', ')})</span>)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {/* Display new trackScore and both perspectives */}
          {scores && typeof scores.trackScore === 'number' && (
            <div style={{ color: '#111', marginTop: 3, fontSize: 15 }}>
              <small>
                <b>Shared Tracks Score:</b> {(scores.trackScore * 100).toFixed(1)}% &nbsp;
                <span style={{ color: '#888' }}>
                  (You: {(scores.trackScorePercentA * 100).toFixed(1)}% &nbsp;|
                  {selectedUserObj?.username ? `${selectedUserObj.username}:` : 'Other:'} {(scores.trackScorePercentB * 100).toFixed(1)}%)
                </span>
              </small>
            </div>
          )}
          {/* Display new trackArtistScore and both perspectives */}
          {scores && typeof scores.trackArtistScore === 'number' && (
            <div style={{ color: '#111', marginTop: 3, fontSize: 15 }}>
              <small>
                <b>Shared Track Artists Score:</b> {(scores.trackArtistScore * 100).toFixed(1)}% &nbsp;
                <span style={{ color: '#888' }}>
                  (You: {(scores.trackArtistScorePercentA * 100).toFixed(1)}% &nbsp;|
                  {selectedUserObj?.username ? `${selectedUserObj.username}:` : 'Other:'} {(scores.trackArtistScorePercentB * 100).toFixed(1)}%)
                </span>
              </small>
            </div>
          )}
          {/* Display new trackGenreScore and both perspectives */}
          {scores && typeof scores.trackGenreScore === 'number' && (
            <div style={{ color: '#111', marginTop: 3, fontSize: 15 }}>
              <small>
                <b>Shared Track Genres Score:</b> {(scores.trackGenreScore * 100).toFixed(1)}% &nbsp;
                <span style={{ color: '#888' }}>
                  (You: {(scores.trackGenreScorePercentA * 100).toFixed(1)}% &nbsp;|
                  {selectedUserObj?.username ? `${selectedUserObj.username}:` : 'Other:'} {(scores.trackGenreScorePercentB * 100).toFixed(1)}%)
                </span>
              </small>
            </div>
          )}
        </div>
        {/* Shared Tracks (Spotify-style) */}
        <div style={{ marginBottom: 14, color: '#111' }}>
          <b>Shared Tracks:</b>
          <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
            {(result.sharedTracks && result.sharedTracks.length > 0
              ? result.sharedTracks.map(track => (
                  <li key={track.trackId} style={{ marginBottom: 18 }}>
                    <SpotifyTrackWithActions
                      track={{
                        id: track.trackId,
                        name: track.trackName,
                        artists: (track.artists || []).map(a => ({ name: a })),
                        album: track.albumName ? { name: track.albumName, images: [{ url: track.albumImage }] } : undefined,
                        external_urls: track.spotifyUrl ? { spotify: track.spotifyUrl } : undefined
                      }}
                      musilikedIds={musilikedIds}
                      refreshMusilikedIds={refreshMusiliked}
                      showRecommend={false}
                    />
                  </li>
                ))
              : sharedTrackIds.map(tid => (
                  <li key={tid} style={{ marginBottom: 18 }}>
                    <SpotifyTrackWithActions
                      track={{ id: tid, name: tid, artists: [], album: undefined, external_urls: undefined }}
                      musilikedIds={musilikedIds}
                      refreshMusilikedIds={refreshMusiliked}
                      showRecommend={false}
                    />
                  </li>
                ))
            )}
          </ul>
        </div>
        {/* Shared Artists/Genres */}
        <div style={{ marginBottom: 14, color: '#111' }}>
          <b>Shared Track Artists:</b> {sharedTrackArtists.join(', ')}
        </div>
        <div style={{ marginBottom: 14, color: '#111' }}>
          <b>Shared Track Genres:</b> {sharedTrackGenres.join(', ')}
        </div>
        <div style={{ marginBottom: 14, color: '#111' }}>
          <b>Shared Profile Artists:</b> {sharedProfileArtists.join(', ')}
        </div>
        <div style={{ color: '#111', marginBottom: 14 }}>
          <b>Shared Profile Genres:</b> {sharedProfileGenres.join(', ')}
        </div>
        {/* Recommended Tracks (Spotify-style) */}
        {recommendations && recommendations.length > 0 && (
          <div style={{ marginTop: 22, color: '#111' }}>
            <b>Recommended Tracks:</b>
            <ul style={{ margin: '6px 0 0 0', padding: 0, listStyle: 'none', color: '#111' }}>
              {recommendations.slice(0, 10).map(t => (
                <li key={t.trackId} style={{ marginBottom: 18 }}>
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
                    showRecommend={true}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
