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
        <h3>Your favorite genres</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
          {SPOTIFY_GENRES.map(genre => (
            <label key={genre} style={{display: 'flex', alignItems: 'center', gap: 4, background: selectedGenres.includes(genre) ? '#b2f5ea' : '#eee', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#111'}}>
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => handleGenreChange(genre)}
                style={{marginRight: 4}}
              />
              {genre}
            </label>
          ))}
        </div>
        {hasChangedRef.current && saveStatus && (
          <div style={{marginTop: 8, fontSize: 13, color: saveStatus === 'Saved' ? 'green' : 'red'}}>
            {saveStatus === 'Saved' ? 'Genres saved!' : 'Error saving genres'}
          </div>
        )}

        {/* Affichage artistes populaires (MIXTE) */}
        <div style={{marginTop: 24}}>
          <h4>Your favorite artists</h4>
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
        <h4>Your favorite tracks</h4>
        {favTracksError ? (
          <div style={{fontSize: 13, color: 'red'}}>{favTracksError}</div>
        ) : loadingFavTracks ? (
          <div style={{fontSize: 13, color: '#888'}}>Chargement…</div>
        ) : favouriteTracks.length === 0 ? (
          <div style={{fontSize: 13, color: '#888'}}>Aucun morceau à afficher</div>
        ) : (
          <ul className="music-profile-list">
            {favouriteTracks.map((track, i) => (
              <li key={track.id} className="music-profile-track" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div>{i + 1}. {track.name} — {track.artists && track.artists.map(a => a.name).join(', ')}</div>
                <MusilikeButton
                  track={track}
                  musilikedIds={musilikedIds}
                  refreshMusilikedIds={refreshMusilikedIds}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

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
