import React, { useEffect, useState, useRef } from 'react';
import API_URL from './api';
import SPOTIFY_GENRES from './spotifyGenres';
import MusilikeButton from './MusilikeButton';

export default function MusicPreferences() {
  // State for Musi-Liked track IDs
  const [musilikedIds, setMusilikedIds] = useState([]);

  // Refresh musilikedIds from backend
  const refreshMusilikedIds = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/musiliked`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setMusilikedIds(Array.isArray(data.tracks) ? data.tracks.map(t => t.trackId) : []);
      }
    } catch {}
  };

  // Load musilikedIds on mount
  useEffect(() => {
    refreshMusilikedIds();
  }, []);

  // State for genres, artists, and tracks
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [popularArtists, setPopularArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [favouriteTracks, setFavouriteTracks] = useState([]);
  const [loadingFavTracks, setLoadingFavTracks] = useState(false);
  const [favTracksError, setFavTracksError] = useState('');
  const initialLoadRef = useRef(true);

  // Load genres and artists from profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.musiliked_genres && Array.isArray(data.musiliked_genres)) {
          setSelectedGenres(data.musiliked_genres);
        }
        if (data.musiliked_artistes && Array.isArray(data.musiliked_artistes)) {
          setSelectedArtists(data.musiliked_artistes);
        }
        initialLoadRef.current = false;
      })
      .catch(() => { initialLoadRef.current = false; });
  }, []);

  // Auto-save genres
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (!selectedGenres) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaveStatus('');
    fetch(`${API_URL}/api/profile/genres`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ genres: selectedGenres })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => setSaveStatus('Saved'))
      .catch(() => setSaveStatus('Error'));
  }, [selectedGenres]);

  // Auto-save artists
  useEffect(() => {
    if (initialLoadRef.current) return;
    if (!selectedArtists) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/profile/artistes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ artistes: selectedArtists })
    });
  }, [selectedArtists]);

  // Hide 'Genres saved!' after 2 seconds
  useEffect(() => {
    if (saveStatus === 'Saved') {
      const timer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Fetch popular tracks for selected artists
  useEffect(() => {
    if (!selectedArtists || selectedArtists.length === 0) {
      setFavouriteTracks([]);
      setFavTracksError('');
      return;
    }
    setLoadingFavTracks(true);
    setFavTracksError('');
    fetch(`${API_URL}/api/spotify/popular-tracks-by-artists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      },
      body: JSON.stringify({ artistIds: selectedArtists })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setFavouriteTracks(data.tracks || []);
        setLoadingFavTracks(false);
      })
      .catch(() => {
        setFavTracksError('Erreur lors du chargement des morceaux populaires');
        setLoadingFavTracks(false);
      });
  }, [selectedArtists]);

  // Load artists for selected genres
  useEffect(() => {
    if (!selectedGenres || selectedGenres.length === 0) {
      setPopularArtists([]);
      return;
    }
    setLoadingArtists(true);
    Promise.all(selectedGenres.map(genre =>
      fetch(`${API_URL}/api/spotify/mixed-artists-by-genre?genre=${encodeURIComponent(genre)}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => (data.artists || data || []))
        .catch(() => [])
    )).then(results => {
      const all = [].concat(...results);
      const seen = new Set();
      const unique = all.filter(a => {
        const key = (a.id || '').toLowerCase() + '|' + (a.name || '').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setPopularArtists(unique);
      setLoadingArtists(false);
    });
  }, [selectedGenres]);

  // Helper for genre selection
  const hasChangedRef = useRef(false);
  const handleGenreChange = (genre) => {
    hasChangedRef.current = true;
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Helper for artist selection
  const handleArtistToggle = (artistId) => {
    setSelectedArtists(prev =>
      prev.includes(artistId)
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  return (
    <div className="music-preferences-container" style={{maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(30,185,84,0.10)', padding: '2.5rem 2.5rem 1.5rem 2.5rem', color: '#111'}}>
      <h2 style={{color: '#1db954', marginBottom: 28}}>Music Preferences</h2>
      {/* Genres Section */}
      <div className="genre-selection" style={{marginBottom: 24}}>
        <h3>Select your favorite genres</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
          {(() => {
            const genreIcons = {
              "pop": "🎤",
              "rock": "🎸",
              "hip hop": "🎧",
              "indie": "🎨",
              "electronic": "🎛️",
              "dance": "💃",
              "jazz": "🎷",
              "classical": "🎻",
              "metal": "🤘",
              "r&b": "🎶",
              "soul": "❤️",
              "reggae": "🌴",
              "punk": "🏴",
              "folk": "🪕",
              "blues": "🎙️",
              "country": "🤠",
              "funk": "🕺",
              "disco": "✨",
              "house": "🔊",
              "techno": "⚡",
              "trap": "🏆",
              "k-pop": "🎀",
              "latin": "🌶️",
              "alternative": "🎭",
              "ambient": "🌌"
            };
            return SPOTIFY_GENRES.map(genre => (
              <div
                key={genre}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: selectedGenres.includes(genre) ? '#b2f5ea' : '#eee',
                  borderRadius: 8,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  color: '#111',
                  border: selectedGenres.includes(genre) ? '2px solid #319795' : '2px solid transparent',
                  fontWeight: selectedGenres.includes(genre) ? 600 : 400,
                  transition: 'all 0.15s',
                }}
                title={genre}
                onClick={() => handleGenreChange(genre)}
              >
                <span style={{fontSize: '1.15em'}}>{genreIcons[genre]}</span>
                {genre}
              </div>
            ));
          })()}
        </div>
        {hasChangedRef.current && saveStatus && (
          <div style={{marginTop: 8, fontSize: 13, color: saveStatus === 'Saved' ? 'green' : 'red'}}>
            {saveStatus === 'Saved' ? 'Genres saved!' : 'Error saving genres'}
          </div>
        )}
      </div>

      {/* Artists Section */}
      <div style={{marginTop: 24}}>
        <h3>Select your favorite artists</h3>
        {loadingArtists ? (
          <div style={{fontSize: 13, color: '#888'}}>Chargement…</div>
        ) : popularArtists.length === 0 ? (
          <div style={{fontSize: 13, color: '#888'}}>Aucun artiste à afficher</div>
        ) : (
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '14px'}}>
            {popularArtists.map(artist => {
              const isSelected = selectedArtists.includes(artist.id);
              return (
                <div key={artist.id} style={{display: 'flex', alignItems: 'center', background: isSelected ? '#b2f5ea' : '#f6f6f6', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', minWidth: 0, border: isSelected ? '2px solid #319795' : '2px solid transparent'}}
                  title={artist.name}
                  onClick={() => handleArtistToggle(artist.id)}>
                  {artist.images && artist.images.length > 0 && (
                    <img src={artist.images[0].url} alt={artist.name} style={{width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', marginRight: 8}} />
                  )}
                  <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, color: '#111'}}>{artist.name}</span>
                  <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" style={{marginLeft: 8, color: '#1db954', fontWeight: 600, textDecoration: 'none', fontSize: 16}} title="Voir sur Spotify" onClick={e => e.stopPropagation()}>
                    ♫
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tracks Section */}
      <div style={{marginTop: 32}}>
        <h3>Select your favorite tracks</h3>
        {favTracksError ? (
          <div style={{fontSize: 13, color: 'red'}}>{favTracksError}</div>
        ) : loadingFavTracks ? (
          <div style={{fontSize: 13, color: '#888'}}>Chargement…</div>
        ) : favouriteTracks.length === 0 ? (
          <div style={{fontSize: 13, color: '#888'}}>Aucun morceau à afficher</div>
        ) : (
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '14px'}}>
            {favouriteTracks.map(track => (
  <div
    key={track.id}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      background: '#f6f6f6',
      borderRadius: 8,
      padding: '10px 14px',
      minWidth: 0,
      marginBottom: 4,
      gap: 12,
      fontWeight: 600,
      maxWidth: 340,
      minHeight: 54,
      border: '2px solid transparent',
      transition: 'all 0.15s',
      boxSizing: 'border-box'
    }}
    title={track.name}
  >
    <img
      src={track.albumImage || 'https://via.placeholder.com/36?text=%20'}
      alt={track.albumName || 'No album'}
      style={{width: 36, height: 36, objectFit: 'cover', borderRadius: '50%', marginRight: 8, background: '#eee'}}
    />
    <span style={{
      whiteSpace: 'normal',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 140,
      color: '#111',
      display: 'inline-block',
      wordBreak: 'break-word',
      fontSize: 15,
      lineHeight: 1.3,
      marginLeft: 10
    }}>{track.trackName || track.name}</span>
    <MusilikeButton track={track} musilikedIds={musilikedIds} refreshMusilikedIds={refreshMusilikedIds} />
  </div>
))}
          </div>
        )}
      </div>
    </div>
  );
}
