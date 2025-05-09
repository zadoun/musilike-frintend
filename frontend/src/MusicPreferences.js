import React, { useEffect, useState, useRef } from 'react';
import API_URL from './api';
import SPOTIFY_GENRES from './spotifyGenres';
import MusilikeButton from './MusilikeButton';

// --- Music Skills Section ---
// (already defined below)

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
    <>
      <MusicSkillsSection />
      <div className="music-preferences-container" style={{maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(30,185,84,0.10)', padding: '2.5rem 2.5rem 1.5rem 2.5rem', color: '#111'}}>
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
    </>
  );
}

const INSTRUMENT_CATEGORIES = [
  { category: 'Cordes-Cordes frottées', instruments: ['Violon', 'Alto', 'Violoncelle', 'Contrebasse'] },
  { category: 'Cordes-Cordes pincées', instruments: ['Guitare acoustique', 'Guitare électrique', 'Basse', 'Harpe', 'Ukulélé', 'Banjo', 'Mandoline', 'Lyre'] },
  { category: 'Claviers-Classiques', instruments: ['Piano', 'Clavecin', 'Orgue'] },
  { category: 'Claviers-Électroniques', instruments: ['Synthétiseur', 'Clavier MIDI', 'Piano numérique'] },
  { category: 'Claviers-Traditionnels', instruments: ['Accordéon', 'Harmonium'] },
  { category: 'Vent - Cuivres--', instruments: ['Trompette', 'Cornet à pistons', 'Trombone', 'Cor d’harmonie', 'Tuba', 'Euphonium', 'Bugle', 'Sousaphone'] },
  { category: 'Vent - Bois-Avec anche simple', instruments: ['Clarinette', 'Saxophone'] },
  { category: 'Vent - Bois-Avec anche double', instruments: ['Hautbois', 'Basson'] },
  { category: 'Vent - Bois-Sans anche', instruments: ['Flûte traversière', 'Flûte à bec', 'Piccolo', 'Ocarina', 'Didgeridoo'] },
  { category: 'Percussions-Membranophones', instruments: ['Tambour', 'Congas', 'Djembé', 'Timbales', 'Bongos', 'Batterie'] },
  { category: 'Percussions-Idiophones', instruments: ['Xylophone', 'Marimba', 'Glockenspiel', 'Triangle', 'Castagnettes', 'Cloche', 'Tambourin'] },
  { category: 'Percussions-Électroniques', instruments: ['Pad de batterie électronique', 'Boîte à rythmes'] },
  { category: 'Électroniques--', instruments: ['Synthétiseur', 'Sampler', 'Séquenceur', 'Theremin', 'Ondes Martenot', 'Contrôleur MIDI'] }
];

// Build instrument-to-category lookup
const INSTRUMENT_TO_CATEGORY = {};
INSTRUMENT_CATEGORIES.forEach(cat => {
  cat.instruments.forEach(inst => {
    INSTRUMENT_TO_CATEGORY[inst] = cat.category;
  });
});

// Most popular instruments first
const POPULAR_INSTRUMENTS_ORDER = [
  'Piano', 'Guitare acoustique', 'Guitare électrique', 'Batterie', 'Violon', 'Basse', 'Synthétiseur', 'Saxophone', 'Clarinette', 'Flûte traversière', 'Trompette', 'Ukulélé', 'Accordéon', 'Harmonium', 'Violoncelle', 'Hautbois', 'Tambour', 'Congas', 'Djembé', 'Timbales', 'Bongos', 'Marimba', 'Xylophone', 'Triangle', 'Castagnettes', 'Cloche', 'Tambourin', 'Banjo', 'Mandoline', 'Lyre', 'Clavecin', 'Orgue', 'Clavier MIDI', 'Piano numérique', 'Harpe', 'Cornet à pistons', 'Trombone', 'Cor d’harmonie', 'Tuba', 'Euphonium', 'Bugle', 'Sousaphone', 'Basson', 'Piccolo', 'Ocarina', 'Didgeridoo', 'Pad de batterie électronique', 'Boîte à rythmes', 'Sampler', 'Séquenceur', 'Theremin', 'Ondes Martenot', 'Contrôleur MIDI', 'Glockenspiel'
];

const ALL_INSTRUMENTS = Array.from(
  new Set(INSTRUMENT_CATEGORIES.flatMap(c => c.instruments))
);

const SORTED_INSTRUMENTS = POPULAR_INSTRUMENTS_ORDER.filter(i => ALL_INSTRUMENTS.includes(i));

const INSTRUMENT_LEVELS = ['beginner', 'intermediate', 'advanced'];

function MusicSkillsSection() {
  const [musicSkills, setMusicSkills] = React.useState({
    isSinger: false,
    singerLevel: 'beginner',
    isMusician: false,
    instruments: []
  });
  const [saveStatus, setSaveStatus] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [editMode, setEditMode] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);
    fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data.musicSkills) setMusicSkills({
          isSinger: !!data.musicSkills.isSinger,
          singerLevel: data.musicSkills.singerLevel || 'beginner',
          isMusician: !!data.musicSkills.isMusician,
          instruments: Array.isArray(data.musicSkills.instruments) ? data.musicSkills.instruments : []
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Add instrument from dropdown
  const handleAddInstrument = (instrument) => {
    setMusicSkills(ms => {
      if (ms.instruments.some(i => i.name === instrument)) return ms;
      const category = INSTRUMENT_TO_CATEGORY[instrument] || '';
      return { ...ms, instruments: [...ms.instruments, { name: instrument, category, level: 'beginner' }] };
    });
  };


  // Remove instrument
  const handleRemoveInstrument = (instrument) => {
    setMusicSkills(ms => ({
      ...ms,
      instruments: ms.instruments.filter(i => i.name !== instrument)
    }));
  };

  // Change instrument level
  const handleInstrumentLevelChange = (instrument, level) => {
    setMusicSkills(ms => ({
      ...ms,
      instruments: ms.instruments.map(i => i.name === instrument ? { ...i, level } : i)
    }));
  };

  const handleSave = e => {
    e.preventDefault();
    setSaveStatus('');
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ musicSkills })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => {
        setSaveStatus('Saved');
        setEditMode(false);
      })
      .catch(() => setSaveStatus('Error'));
  };

  if (loading) return <div style={{marginTop: 40}}>Loading music skills…</div>;
  return (
    <div style={{marginTop: 48, padding: 24, background: '#fafbfc', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto'}}>
      <h3 style={{marginBottom: 18}}>Music Skills</h3>
      <form onSubmit={handleSave} style={{ textAlign: 'left' }}>
        <div style={{marginBottom: 18}}>
          <label style={{fontWeight: 600, marginRight: 16}}>
            <input type="checkbox" checked={musicSkills.isSinger} onChange={e => setMusicSkills(ms => ({...ms, isSinger: e.target.checked}))} disabled={!editMode} />
            &nbsp;I am a singer
          </label>
          {musicSkills.isSinger && (
            <span style={{marginLeft: 18}}>
              Level:&nbsp;
              <select value={musicSkills.singerLevel} onChange={e => setMusicSkills(ms => ({...ms, singerLevel: e.target.value}))} disabled={!editMode}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </span>
          )}
        </div>
        <div style={{marginBottom: 18}}>
          <label style={{fontWeight: 600, marginRight: 16}}>
            <input type="checkbox" checked={musicSkills.isMusician} onChange={e => setMusicSkills(ms => ({...ms, isMusician: e.target.checked}))} disabled={!editMode} />
            &nbsp;I am a musician
          </label>
        </div>
        {musicSkills.isMusician && (
          <div style={{marginBottom: 18}}>
            <label style={{fontWeight: 600, marginRight: 16}}>
              Instrument:
              <select
                style={{marginLeft: 10, minWidth: 200}}
                onChange={e => handleAddInstrument(e.target.value)}
                value=""
                disabled={!editMode}
              >
                <option value="" disabled>
                  Select an instrument
                </option>
                {SORTED_INSTRUMENTS.map(inst => (
                  <option key={inst} value={inst} disabled={musicSkills.instruments.some(i => i.name === inst)}>
                    {inst}
                  </option>
                ))}
              </select>
            </label>
            <div style={{marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
              {musicSkills.instruments.map(inst => (
                <div key={inst.name} style={{display: 'flex', alignItems: 'center', background: '#b2f5ea', borderRadius: 8, padding: '4px 10px', gap: 8}}>
                  <span>{inst.name}</span>
                  <select
                    style={{marginLeft: 6}}
                    value={inst.level}
                    onChange={e => handleInstrumentLevelChange(inst.name, e.target.value)}
                    disabled={!editMode}
                  >
                    {INSTRUMENT_LEVELS.map(lvl => (
                      <option key={lvl} value={lvl}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </option>
                    ))}
                  </select>
                  {editMode && (
                    <button type="button" style={{marginLeft: 6, background: 'transparent', border: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: 700}} onClick={() => handleRemoveInstrument(inst.name)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {editMode ? (
          <button type="submit" style={{marginTop: 18, padding: '8px 32px', background: '#319795', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer'}}>Save</button>
        ) : (
          <button type="button" style={{marginTop: 18, padding: '8px 32px', background: '#319795', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer'}} onClick={() => setEditMode(true)}>Edit</button>
        )}
        {saveStatus && <span style={{marginLeft: 18, color: saveStatus==='Saved'?'green':'red', fontWeight: 600}}>{saveStatus==='Saved' ? 'Saved!' : 'Error saving'}</span>}
      </form>
    </div>
  );
}
