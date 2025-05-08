import React, { useEffect, useState } from 'react';
import API_URL from './api';
import './MusicProfile.css';
import SPOTIFY_GENRES from './spotifyGenres';
import MusilikeButton from './MusilikeButton';

// Dropdown for instruments with show more/less
// --- Instrument list logic: keep at top-level so always available ---
const POPULAR_ORDER = [
  'Piano',
  'Guitare acoustique',
  'Guitare électrique',
  'Violon',
  'Batterie',
  'Basse',
  'Saxophone',
  'Synthétiseur',
  'Flûte traversière',
  'Trompette',
  'Clarinette',
  'Accordéon',
];
const RAW_INSTRUMENT_OPTIONS = [
  { category: 'Cordes-Cordes frottées', name: 'Violon' },
  { category: 'Cordes-Cordes frottées', name: 'Alto' },
  { category: 'Cordes-Cordes frottées', name: 'Violoncellle' },
  { category: 'Cordes-Cordes frottées', name: 'Contrebasse' },
  { category: 'Cordes-Cordes pincées', name: 'Guitare acoustique' },
  { category: 'Cordes-Cordes pincées', name: 'Guitare électrique' },
  { category: 'Cordes-Cordes pincées', name: 'Basse' },
  { category: 'Cordes-Cordes pincées', name: 'Harp' },
  { category: 'Cordes-Cordes pincées', name: 'Ukulélé' },
  { category: 'Cordes-Cordes pincées', name: 'Banjo' },
  { category: 'Cordes-Cordes pincées', name: 'Mandoline' },
  { category: 'Cordes-Cordes pincées', name: 'Lyre' },
  { category: 'Claviers-Classiques', name: 'Piano' },
  { category: 'Claviers-Classiques', name: 'Clavecin' },
  { category: 'Claviers-Classiques', name: 'Orgue' },
  { category: 'Claviers-Électroniques', name: 'Synthétiseur' },
  { category: 'Claviers-Électroniques', name: 'Clavier MIDI' },
  { category: 'Claviers-Électroniques', name: 'Piano numérique' },
  { category: 'Claviers-Traditionnels', name: 'Accordéon' },
  { category: 'Claviers-Traditionnels', name: 'Harmonium' },
  { category: 'Vent - Cuivres--', name: 'Trompette' },
  { category: 'Vent - Cuivres--', name: 'Cornet à pistons' },
  { category: 'Vent - Cuivres--', name: 'Trombone' },
  { category: 'Vent - Cuivres--', name: 'Cor d’harmonie' },
  { category: 'Vent - Cuivres--', name: 'Tuba' },
  { category: 'Vent - Cuivres--', name: 'Euphonium' },
  { category: 'Vent - Cuivres--', name: 'Bugle' },
  { category: 'Vent - Cuivres--', name: 'Sousaphone' },
  { category: 'Vent - Bois-Avec anche simple', name: 'Clarinette' },
  { category: 'Vent - Bois-Avec anche simple', name: 'Saxophone' },
  { category: 'Vent - Bois-Avec anche double', name: 'Hautbois' },
  { category: 'Vent - Bois-Avec anche double', name: 'Basson' },
  { category: 'Vent - Bois-Sans anche', name: 'Flûte traversière' },
  { category: 'Vent - Bois-Sans anche', name: 'Flûte à bec' },
  { category: 'Vent - Bois-Sans anche', name: 'Piccolo' },
  { category: 'Vent - Bois-Sans anche', name: 'Ocarina' },
  { category: 'Vent - Bois-Sans anche', name: 'Didgeridoo' },
  { category: 'Percussions-Membranophones', name: 'Tambour' },
  { category: 'Percussions-Membranophones', name: 'Congas' },
  { category: 'Percussions-Membranophones', name: 'Djembé' },
  { category: 'Percussions-Membranophones', name: 'Timbales' },
  { category: 'Percussions-Membranophones', name: 'Bongos' },
  { category: 'Percussions-Membranophones', name: 'Batterie' },
  { category: 'Percussions-Idiophones', name: 'Xylophone' },
  { category: 'Percussions-Idiophones', name: 'Marimba' },
  { category: 'Percussions-Idiophones', name: 'Glockenspiel' },
  { category: 'Percussions-Idiophones', name: 'Triangle' },
  { category: 'Percussions-Idiophones', name: 'Castagnettes' },
  { category: 'Percussions-Idiophones', name: 'Cloche' },
  { category: 'Percussions-Idiophones', name: 'Tambourin' },
  { category: 'Percussions-Électroniques', name: 'Pad de batterie électronique' },
  { category: 'Percussions-Électroniques', name: 'Boîte à rythmes' },
  { category: 'Électroniques--', name: 'Synthétiseur' },
  { category: 'Électroniques--', name: 'Sampler' },
  { category: 'Électroniques--', name: 'Séquenceur' },
  { category: 'Électroniques--', name: 'Theremin' },
  { category: 'Électroniques--', name: 'Ondes Martenot' },
  { category: 'Électroniques--', name: 'Contrôleur MIDI' },
];
const INSTRUMENT_OPTIONS = [
  ...POPULAR_ORDER.map(popularName => RAW_INSTRUMENT_OPTIONS.find(opt => opt.name === popularName)).filter(Boolean),
  ...RAW_INSTRUMENT_OPTIONS.filter(opt => !POPULAR_ORDER.includes(opt.name)).sort((a, b) => a.name.localeCompare(b.name)),
];

// Instrument icon mapping
const INSTRUMENT_ICONS = {
  'Piano': '🎹',
  'Guitare acoustique': '🎸',
  'Guitare électrique': '🎸',
  'Violon': '🎻',
  'Batterie': '🥁',
  'Basse': '🎸',
  'Saxophone': '🎷',
  'Synthétiseur': '🎹',
  'Flûte traversière': '🎶',
  'Trompette': '🎺',
  'Clarinette': '🎼',
  'Accordéon': '🪗',
  'Alto': '🎻',
  'Violoncellle': '🎻',
  'Contrebasse': '🎻',
  'Harp': '🎵',
  'Ukulélé': '🪕',
  'Banjo': '🪕',
  'Mandoline': '🪕',
  'Lyre': '🎼',
  'Clavecin': '🎹',
  'Orgue': '🎹',
  'Clavier MIDI': '🎹',
  'Piano numérique': '🎹',
  'Harmonium': '🎹',
  'Cornet à pistons': '🎺',
  'Trombone': '🎺',
  'Cor d’harmonie': '🎺',
  'Tuba': '🎺',
  'Euphonium': '🎺',
  'Bugle': '🎺',
  'Sousaphone': '🎺',
  'Hautbois': '🎼',
  'Basson': '🎼',
  'Flûte à bec': '🎶',
  'Piccolo': '🎶',
  'Ocarina': '🎶',
  'Didgeridoo': '🎵',
  'Tambour': '🥁',
  'Congas': '🥁',
  'Djembé': '🥁',
  'Timbales': '🥁',
  'Bongos': '🥁',
  'Xylophone': '🎼',
  'Marimba': '🎼',
  'Glockenspiel': '🎼',
  'Triangle': '🔔',
  'Castagnettes': '🎶',
  'Cloche': '🔔',
  'Tambourin': '🥁',
  'Pad de batterie électronique': '🥁',
  'Boîte à rythmes': '🥁',
  'Sampler': '🎛️',
  'Séquenceur': '🎛️',
  'Theremin': '🎛️',
  'Ondes Martenot': '🎛️',
  'Contrôleur MIDI': '🎹',
};

function InstrumentDropdown({ value, onChange, options = INSTRUMENT_OPTIONS }) {
  const [open, setOpen] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const visibleOptions = showAll ? options : options.slice(0, 10);
  const selectedLabel = value ? (options.find(opt => opt.name === value)?.name || value) : 'Select instrument';

  return (
    <span ref={dropdownRef} style={{ display: 'inline-block', minWidth: 140, marginRight: 10, position: 'relative' }}>
      <div
        style={{
          padding: 6,
          borderRadius: 5,
          border: '1px solid #bbb',
          minWidth: 120,
          background: '#fff',
          cursor: 'pointer',
          userSelect: 'none',
          color: '#222',
        }}
        onClick={() => setOpen(o => !o)}
      >
        {selectedLabel}
        <span style={{ float: 'right', marginLeft: 8 }}>&#9662;</span>
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #bbb',
            borderRadius: 5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            maxHeight: 240,
            overflowY: 'auto',
            marginTop: 2
          }}
        >
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <div
              key="empty"
              style={{ padding: '6px 12px', color: '#222', cursor: 'pointer', background: !value ? '#f2f2f2' : 'transparent' }}
              onClick={() => { onChange({ target: { value: '' } }); setOpen(false); }}
            >
              Select instrument
            </div>
            {visibleOptions.map((opt, i) => (
              <div
                key={opt.name}
                style={{ padding: '6px 12px', cursor: 'pointer', color: '#222', background: value === opt.name ? '#e6f0ff' : 'transparent' }}
                onClick={() => { onChange({ target: { value: opt.name } }); setOpen(false); }}
              >
                {INSTRUMENT_ICONS[opt.name] || '🎵'} {opt.name}
              </div>
            ))}
            {!showAll && options.length > 10 && (
              <div
                style={{ padding: '6px 12px', cursor: 'pointer', color: '#222', borderTop: '1px solid #eee', background: '#fafafa' }}
                onClick={e => { e.stopPropagation(); setShowAll(true); }}
              >
                Show more...
              </div>
            )}
            {showAll && options.length > 10 && (
              <div
                style={{ padding: '6px 12px', cursor: 'pointer', color: '#222', borderTop: '1px solid #eee', background: '#fafafa' }}
                onClick={e => { e.stopPropagation(); setShowAll(false); }}
              >
                Show less
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}

export default function MusicProfile({ musilikedRefreshFlag }) {
  // --- Profile fields ---
  const [profilePicture, setProfilePicture] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [profileSaveStatus, setProfileSaveStatus] = useState('');
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileInitial, setProfileInitial] = useState({ profilePicture: '', birthday: '', gender: 'prefer_not_to_say', isSinger: false, isMusician: false, instruments: [] });
  const [isSinger, setIsSinger] = useState(false);
  const [singerLevel, setSingerLevel] = useState('beginner');
  const [isMusician, setIsMusician] = useState(false);
  const [instruments, setInstruments] = useState([]);
  // --- Profile fields ---
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
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
        setError('Could not fetch your Musi-Liked tracks');
        setLoading(false);
      });
  }, [musilikedRefreshFlag]);

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

  // Charger les genres, artistes et infos profil déjà enregistrés au montage
  useEffect(() => {
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
    const token = localStorage.getItem('token');
    console.log('[DEBUG] Token:', token);
    if (!token) return;
    console.log('[DEBUG] About to fetch /api/profile');
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
        // Always set, even if empty
        setProfilePicture(data.profilePicture || '');
        setBirthday(data.birthday ? data.birthday.slice(0, 10) : '');
        setGender(data.gender || 'prefer_not_to_say');
        setIsSinger(!!data.isSinger);
        setSingerLevel(data.singerLevel || 'beginner');
        setIsMusician(!!data.isMusician);
        const mappedInstruments = Array.isArray(data.instruments)
  ? data.instruments.map(inst => {
      const option = INSTRUMENT_OPTIONS.find(opt => opt.name === inst.name);
      return { ...inst, category: option ? option.category : '' };
    })
  : [];
        console.log('After profile fetch:', {
          isMusician: data.isMusician,
          instruments: mappedInstruments
        });
        console.log('After profile fetch:', {
          isMusician: data.isMusician,
          instruments: mappedInstruments,
          rawInstruments: data.instruments
        });
        setInstruments(mappedInstruments);
        setProfileInitial({
          profilePicture: data.profilePicture || '',
          birthday: data.birthday ? data.birthday.slice(0, 10) : '',
          gender: data.gender || 'prefer_not_to_say',
          isSinger: !!data.isSinger,
          singerLevel: data.singerLevel || 'beginner',
          isMusician: !!data.isMusician,
          instruments: Array.isArray(data.instruments)
    ? data.instruments.map(inst => {
        const option = INSTRUMENT_OPTIONS.find(opt => opt.name === inst.name);
        return { ...inst, category: option ? option.category : '' };
      })
    : [],
        });
        // Only show edit mode if all fields are empty or default
        if (!(data.profilePicture || (data.birthday && data.birthday !== '') || (data.gender && data.gender !== 'prefer_not_to_say'))) {
          setProfileEditMode(true);
        } else {
          setProfileEditMode(false);
        }
        initialLoadRef.current = false;
      })
      .catch((error) => {
        console.error('[DEBUG] Error fetching /api/profile:', error);
        initialLoadRef.current = false;
      });
    refreshMusilikedIds();
  }, []);

  // Sauvegarde automatique des genres à chaque changement (sauf au premier chargement)
  useEffect(() => {
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
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
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
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
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
    if (saveStatus === 'Saved') {
      const timer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Fetch popular tracks for selected artists
  useEffect(() => {
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
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
  console.log('[DEBUG] MusicProfile profile-fetch useEffect running');
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

  // Save profile fields (picture, birthday, gender)
  // Instrument helpers
  // Instrument categories and list
  
  const handleInstrumentChange = (idx, field, value) => {
    setInstruments(prev => prev.map((inst, i) => {
      if (i === idx) {
        if (field === 'name') {
          const option = INSTRUMENT_OPTIONS.find(opt => opt.name === value);
          return { ...inst, name: value, category: option ? option.category : '', };
        }
        return { ...inst, [field]: value };
      }
      return inst;
    }));
  };
  const handleAddInstrument = () => {
    setInstruments(prev => [...prev, { name: '', level: 'beginner' }]);
  };
  const handleRemoveInstrument = idx => {
    setInstruments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleProfileSave = async (e) => {
  // Debug: log instruments being sent
  console.log('Saving instruments:', instruments);
    e.preventDefault();
    setProfileSaveStatus('');
    const token = localStorage.getItem('token');
    if (!token) return setProfileSaveStatus('Not logged in.');
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          profilePicture,
          birthday,
          gender,
          isSinger,
          singerLevel,
          isMusician,
          instruments
        })
      });
      if (!res.ok) throw new Error('API error');
    // Debug: log backend response
    const responseData = await res.json();
    console.log('Backend response:', responseData);
    setProfileSaveStatus('Saved!');
    setProfileEditMode(false); // Switch to read-only mode after save
    return;
    } catch {
      setProfileSaveStatus('Error saving profile');
    }
  };

  return (
    <div className="music-profile-container">
      {/* User profile section */}
      <form onSubmit={handleProfileSave} style={{ marginBottom: 32, padding: 18, background: '#f6f6f9', borderRadius: 10, maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <img
            src={profilePicture || 'https://ui-avatars.com/api/?name=User&background=888&color=fff&size=96'}
            alt="Profile"
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginRight: 16, border: '2px solid #ddd', background: '#eee' }}
          />
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600, fontSize: 16, color: '#111' }}>Profile Picture URL:</label>
                {profileEditMode ? (
                  <input
                    type="url"
                    value={profilePicture}
                    onChange={e => setProfilePicture(e.target.value)}
                    placeholder="Paste image URL here"
                    style={{ width: '100%', padding: 7, borderRadius: 6, border: '1px solid #bbb', marginTop: 4 }}
                  />
                ) : (
                  <div style={{ color: '#222', fontSize: 15, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{profilePicture || <span style={{color:'#888'}}>No picture set</span>}</div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 14, textAlign: 'left' }}>
              <label style={{ fontWeight: 600, color: '#111', display: 'inline-block', minWidth: 90 }}>Birthday:</label>
              {profileEditMode ? (
                <input
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  style={{ padding: 7, borderRadius: 6, border: '1px solid #bbb', marginLeft: 8, textAlign: 'left' }}
                />
              ) : (
                <span style={{ marginLeft: 12, color: birthday ? '#222' : '#888', fontSize: 15, textAlign: 'left', display: 'inline-block', minWidth: 120 }}>{birthday || 'Not set'}</span>
              )}
            </div>
            <div style={{ marginBottom: 14, textAlign: 'left' }}>
              <label style={{ fontWeight: 600, color: '#111', display: 'inline-block', minWidth: 90 }}>Gender:</label>
              {profileEditMode ? (
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  style={{ padding: 7, borderRadius: 6, border: '1px solid #bbb', marginLeft: 8, textAlign: 'left' }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              ) : (
                <span style={{ marginLeft: 12, color: gender && gender !== 'prefer_not_to_say' ? '#222' : '#888', fontSize: 15 }}>
                  {gender === 'male' && 'Male'}
                  {gender === 'female' && 'Female'}
                  {gender === 'other' && 'Other'}
                  {(!gender || gender === 'prefer_not_to_say') && 'Not set'}
                </span>
              )}
            </div>

            {/* Singer/Musician Section */}
            <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center' }}>
              <label style={{ fontWeight: 600, color: '#111', marginRight: 18 }}>Are you a singer?</label>
              {profileEditMode ? (
              <>
                <input type="checkbox" checked={isSinger} onChange={e => setIsSinger(e.target.checked)} style={{ marginLeft: 8, transform: 'scale(1.2)' }} />
                {isSinger && (
                  <select
                    value={singerLevel}
                    onChange={e => setSingerLevel(e.target.value)}
                    style={{ marginLeft: 16, padding: 6, borderRadius: 5, border: '1px solid #bbb', minWidth: 130 }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                )}
              </>
            ) : (
              <span style={{ marginLeft: 12, color: isSinger ? '#222' : '#888', fontSize: 15 }}>
                {isSinger ? 'Yes' : 'No'}
                {isSinger && (
                  <span style={{ color: '#888', marginLeft: 12 }}>({singerLevel})</span>
                )}
              </span>
            )}
          </div>
        {isMusician && (
          <div style={{ marginBottom: 14, marginLeft: 16, textAlign: 'left' }}>
            <label style={{ fontWeight: 600, color: '#111', marginBottom: 6, display: 'block', textAlign: 'left' }}>Instruments played:</label>
            {profileEditMode ? (
              <>
                {instruments.map((inst, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                    {/* Instrument dropdown with show more/less */}
                    <InstrumentDropdown
                      value={inst.name}
                      onChange={e => handleInstrumentChange(idx, 'name', e.target.value)}
                      options={INSTRUMENT_OPTIONS}
                    />
                    <select
                      value={inst.level}
                      onChange={e => handleInstrumentChange(idx, 'level', e.target.value)}
                      style={{ padding: 6, borderRadius: 5, border: '1px solid #bbb', minWidth: 110, marginRight: 10 }}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <button type="button" onClick={() => handleRemoveInstrument(idx)} style={{ background: '#eee', border: 'none', borderRadius: 5, color: '#a00', padding: '2px 10px', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>×</button>
                  </div>
                ))}
                <button type="button" onClick={handleAddInstrument} style={{ background: '#1db954', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, fontSize: 15, marginTop: 4 }}>Add instrument</button>
              </>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'left' }}>
                {instruments.length === 0 && <li style={{ color: '#888', fontSize: 15 }}>No instruments listed</li>}
                {instruments.map((inst, idx) => (
                  <li key={idx} style={{ color: '#222', fontSize: 15, marginBottom: 2, textAlign: 'left' }}>
                    {inst.name ? (<span>{INSTRUMENT_ICONS[inst.name] || '🎵'} {inst.name}</span>) : <span style={{ color: '#aaa' }}>[Unnamed]</span>} 
                    <span style={{ color: '#888', marginLeft: 8 }}>({inst.level})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {profileEditMode ? (
          <>
            <button type="submit" style={{ padding: '8px 22px', borderRadius: 7, background: '#1db954', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginTop: 6 }}>Save</button>
            <button type="button" onClick={() => {
              setProfilePicture(profileInitial.profilePicture);
              setBirthday(profileInitial.birthday);
              setGender(profileInitial.gender);
              setIsSinger(profileInitial.isSinger);
              setSingerLevel(profileInitial.singerLevel);
              setIsMusician(profileInitial.isMusician);
              setInstruments(profileInitial.instruments);
              setProfileEditMode(false);
              setProfileSaveStatus('');
            }} style={{ marginLeft: 10, padding: '8px 18px', borderRadius: 7, background: '#eee', color: '#222', fontWeight: 500, fontSize: 16, border: 'none', marginTop: 6 }}>Cancel</button>
          </>
        ) : (
          <button type="button" onClick={() => setProfileEditMode(true)} style={{ padding: '8px 22px', borderRadius: 7, background: '#222', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', marginTop: 6 }}>Edit</button>
        )}
        {profileSaveStatus && <span style={{ marginLeft: 14, color: profileSaveStatus === 'Saved!' ? '#1db954' : 'red', fontWeight: 500 }}>{profileSaveStatus}</span>}
      </form>
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
        {/* Sender box right-aligned */}
        {track.fromUser && track.fromUser.username && (
          <div style={{
            marginLeft: 18,
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


