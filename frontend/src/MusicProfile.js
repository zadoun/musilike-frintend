import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';
import SPOTIFY_GENRES from './spotifyGenres';
import MusilikeButton from './MusilikeButton';

export default function MusicProfile() {
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
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load your Musi-Liked tracks.');
        setLoading(false);
      });
  }, []);

  // State pour la sélection des genres
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [popularArtists, setPopularArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [favouriteTracks, setFavouriteTracks] = useState([]);
  const [loadingFavTracks, setLoadingFavTracks] = useState(false);
  const [favTracksError, setFavTracksError] = useState('');
  const [musilikedIds, setMusilikedIds] = useState([]);
  const initialLoadRef = React.useRef(true);

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

  // Charger les genres ET artistes déjà enregistrés au montage
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
    refreshMusilikedIds();
  }, []);

  // Sauvegarde automatique des genres à chaque changement (sauf au premier chargement)
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

  // Sauvegarde automatique des artistes à chaque changement (sauf au premier chargement)
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

  // Cache le message 'Genres saved!' après 2 secondes
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

  // Charge la liste mixte (statique + Spotify) pour les genres sélectionnés
  useEffect(() => {
    if (!selectedGenres || selectedGenres.length === 0) {
      setPopularArtists([]);
      return;
    }
    setLoadingArtists(true);
    // Appels parallèles pour chaque genre (endpoint MIXTE)
    Promise.all(selectedGenres.map(genre =>
      fetch(`${API_URL}/api/spotify/mixed-artists-by-genre?genre=${encodeURIComponent(genre)}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => (data.artists || data || []))
        .catch(() => [])
    )).then(results => {
      // Fusionne les artistes (évite doublons par id ou par nom)
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

  // Pour ne pas afficher le message au chargement initial
  const hasChangedRef = React.useRef(false);

  const handleGenreChange = (genre) => {
    hasChangedRef.current = true;
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  if (loading) return <div className="music-profile-loading">Loading...</div>;
  if (error) return <div className="music-profile-error">{error}</div>;

  return (
    <div className="music-profile-container">
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

        {/* Affichage artistes populaires (MIXTE) */}
        <div style={{marginTop: 24}}>
          <h4>Select your favorite artists</h4>
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
      onClick={() => {
        setSelectedArtists(prev => prev.includes(artist.id) ? prev.filter(id => id !== artist.id) : [...prev, artist.id]);
      }}>
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
      </div>

      {/* Affichage morceaux populaires pour les artistes sélectionnés */}
      <div style={{marginTop: 32}}>
        <h4>Select your favorite tracks</h4>
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
      maxWidth: 220,
      color: '#111',
      display: 'inline-block',
      wordBreak: 'break-word',
      fontSize: 15,
      lineHeight: 1.3,
      marginLeft: 10
    }}>{track.trackName || track.name}</span>
    <MusilikeButton
      track={track}
      musilikedIds={musilikedIds}
      refreshMusilikedIds={refreshMusilikedIds}
    />
  </div>
))}
          </div>
        )}
      </div>

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
          maxWidth: 600,
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
            fontSize: 16,
            color: '#222',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.25,
          }}>{track.trackName || track.name}</span>
          <span style={{
            fontSize: 13,
            color: '#666',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {Array.isArray(track.artists) ? track.artists.join(', ') : ''}
            {track.albumName ? <span style={{margin: '0 6px', color: '#bbb'}}>&#183;</span> : null}
            {track.albumName ? <span style={{color: '#888'}}>{track.albumName}</span> : null}
          </span>
        </div>
        {/* Spotify link */}
        {track.spotifyUrl && (
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 16,
              color: '#1DB954',
              fontWeight: 700,
              fontSize: 20,
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 54,
              borderRadius: 10,
              padding: '6px 10px',
              background: '#fff',
              boxSizing: 'border-box',
              transition: 'border 0.15s, box-shadow 0.15s',
            }}
            title="Play on Spotify"
            onClick={e => e.stopPropagation()}
          >
            <span
              aria-label="Spotify"
              style={{
                background: '#1DB954',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 4px auto',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                <polygon points="4,2 14,8 4,14" />
              </svg>
            </span>
            <span style={{fontSize: 12, color: '#1DB954', fontWeight: 700, letterSpacing: 0.5, marginTop: 0}}>Spotify</span>
          </a>
        )}
      </div>
    ))}
  </div>
)}
    </div>
  );
}
