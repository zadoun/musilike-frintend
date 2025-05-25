import React, { useState } from 'react';
import './OnboardingWizard.css';

// Placeholders à remplacer par les vrais composants/formulaires
function PersonalProfileStep({ data, onChange }) {
  const [gpsLoading, setGpsLoading] = React.useState(false);
  const [gpsError, setGpsError] = React.useState('');

  const handleGetGPS = () => {
    setGpsLoading(true);
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        onChange({ ...data, useGPS: true, location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, city: '' });
        setGpsLoading(false);
      },
      err => {
        setGpsError('Could not get your location.');
        setGpsLoading(false);
      }
    );
  };

  return (
    <div style={{minHeight:120}}>
      <h2>Personal Profile</h2>
      <div style={{marginBottom: 18}}>
        <label style={{fontWeight: 600, marginRight: 16}}>
          Birthday:
          <input
            type="date"
            value={data.birthday || ''}
            onChange={e => onChange({ ...data, birthday: e.target.value })}
            style={{marginLeft: 10}}
          />
        </label>
      </div>
      <div style={{marginBottom: 18}}>
        <label style={{fontWeight: 600, marginRight: 16}}>
          Gender:
          <select
            value={data.gender || 'prefer_not_to_say'}
            onChange={e => onChange({ ...data, gender: e.target.value })}
            style={{marginLeft: 10}}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
      </div>
      <div style={{marginBottom: 18}}>
        <label style={{fontWeight: 600, marginRight: 16}}>
          <input
            type="checkbox"
            checked={!!data.useGPS}
            onChange={e => {
              if (e.target.checked) handleGetGPS();
              else onChange({ ...data, useGPS: false, location: { latitude: '', longitude: '' } });
            }}
          />
          &nbsp;Use my GPS location
        </label>
        {!!data.useGPS && data.location && data.location.latitude && data.location.longitude && (
          <span style={{marginLeft: 18, color: '#319795'}}>
            Lat: {Number(data.location.latitude).toFixed(5)}, Lng: {Number(data.location.longitude).toFixed(5)}
          </span>
        )}
        {gpsLoading && <span style={{marginLeft: 18, color: '#aaa'}}>Getting location…</span>}
        {gpsError && <span style={{marginLeft: 18, color: '#e53e3e'}}>{gpsError}</span>}
      </div>
      {!data.useGPS && (
        <div style={{marginBottom: 18}}>
          <label style={{fontWeight: 600, marginRight: 16}}>
            City:
            <input
              type="text"
              value={data.city || ''}
              onChange={e => onChange({ ...data, city: e.target.value })}
              style={{marginLeft: 10}}
              placeholder="Your city"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function TracksStep({ selectedArtists, selectedTracks, onChange }) {
  const [tracks, setTracks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    if (!selectedArtists || selectedArtists.length === 0) {
      setTracks([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    fetch(`${require('./api').default}/api/spotify/popular-tracks-by-artists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
      },
      body: JSON.stringify({ artistIds: selectedArtists })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setTracks(data.tracks || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des morceaux populaires');
        setLoading(false);
      });
  }, [selectedArtists]);

  if (loading) return <div style={{margin:'24px 0', color:'#aaa'}}>Loading tracks...</div>;
  if (error) return <div style={{margin:'24px 0', color:'#e53e3e'}}>{error}</div>;
  if (!tracks.length) return <div style={{margin:'24px 0', color:'#aaa'}}>No tracks found for selected artists.</div>;
  return (
    <div style={{maxHeight: '260px', overflowY: 'auto', display:'flex', flexWrap:'wrap', gap:'12px', margin:'24px 0', paddingRight:'8px'}}>
      {tracks.map(track => (
        <button
          key={track.id}
          type="button"
          className={`wizard-chip${selectedTracks.includes(track.id) ? ' selected' : ''}`}
          onClick={() => {
            const next = selectedTracks.includes(track.id)
              ? selectedTracks.filter(id => id !== track.id)
              : [...selectedTracks, track.id];
            onChange(next);
          }}
        >
          {track.name}
        </button>
      ))}
    </div>
  );
}

function ArtistsStep({ selectedGenres, selectedArtists, onChange }) {
  const [artists, setArtists] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    if (!selectedGenres || selectedGenres.length === 0) {
      setArtists([]);
      return;
    }
    setLoading(true);
    Promise.all(selectedGenres.map(genre =>
      fetch(`${require('./api').default}/api/spotify/mixed-artists-by-genre?genre=${encodeURIComponent(genre)}`)
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
      setArtists(unique);
      setLoading(false);
    });
  }, [selectedGenres]);

  if (loading) return <div style={{margin:'24px 0', color:'#aaa'}}>Loading artists...</div>;
  if (!artists.length) return <div style={{margin:'24px 0', color:'#aaa'}}>No artists found for selected genres.</div>;
  return (
    <div style={{maxHeight: '260px', overflowY: 'auto', display:'flex', flexWrap:'wrap', gap:'12px', margin:'24px 0', paddingRight:'8px'}}>
      {artists.map(artist => (
        <button
          key={artist.id}
          type="button"
          className={`wizard-chip${selectedArtists.includes(artist.id) ? ' selected' : ''}`}
          onClick={() => {
            const next = selectedArtists.includes(artist.id)
              ? selectedArtists.filter(id => id !== artist.id)
              : [...selectedArtists, artist.id];
            onChange(next);
          }}
        >
          {artist.name}
        </button>
      ))}
    </div>
  );
}

function MusicPreferencesForm({ data, onChange }) {
  const [step, setStep] = useState(1); // 1: genres, 2: artists, 3: tracks

  // TODO: brancher la logique de sélection et filtrage du code existant
  // data = { genres: [], artists: [], tracks: [] }

  return (
    <div>
      <div className="wizard-progress" style={{marginBottom:18}}>
        <div className={`wizard-dot${step === 1 ? ' active' : ''}`}></div>
        <div className={`wizard-dot${step === 2 ? ' active' : ''}`}></div>
        <div className={`wizard-dot${step === 3 ? ' active' : ''}`}></div>
      </div>
      {step === 1 && (
        <div className="wizard-step">
          <h3>Select your favorite genres</h3>
          <div style={{display:'flex',flexWrap:'wrap',gap:'12px',margin:'24px 0'}}>
            {require('./spotifyGenres').default.map(genre => (
              <button
                key={genre}
                type="button"
                className={`wizard-chip${(data.genres||[]).includes(genre) ? ' selected' : ''}`}
                onClick={() => {
                  const genres = (data.genres||[]).includes(genre)
                    ? data.genres.filter(g => g !== genre)
                    : [...(data.genres||[]), genre];
                  onChange({ ...data, genres });
                }}
              >
                {genre}
              </button>
            ))}
          </div>
          <div className="wizard-nav">
            <button className="wizard-btn" onClick={() => setStep(2)} disabled={!(data.genres && data.genres.length)}>Suivant</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="wizard-step">
          <h3>Select your favorite artists</h3>
          <ArtistsStep
            selectedGenres={data.genres || []}
            selectedArtists={data.artists || []}
            onChange={artists => onChange({ ...data, artists })}
          />
          <div className="wizard-nav">
            <button className="wizard-btn" onClick={() => setStep(1)}>Précédent</button>
            <button className="wizard-btn" onClick={() => setStep(3)} disabled={!(data.artists && data.artists.length)}>Suivant</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="wizard-step">
          <h3>Select your favorite tracks</h3>
          <TracksStep
            selectedArtists={data.artists || []}
            selectedTracks={data.tracks || []}
            onChange={tracks => onChange({ ...data, tracks })}
          />
          <div className="wizard-nav">
            <button className="wizard-btn" onClick={() => setStep(2)}>Précédent</button>
            {/* Le bouton suivant/valider sera dans le wizard principal */}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingWizard({ onComplete, saveStep, initialProfile }) {
  const [step, setStep] = useState(1); // 1: profil, 2: préférences musicales
  const [profileData, setProfileData] = useState(initialProfile ? {
    birthday: initialProfile.birthday ? initialProfile.birthday.substr(0,10) : '',
    gender: initialProfile.gender || 'prefer_not_to_say',
    city: initialProfile.city || '',
    useGPS: !!(initialProfile.location && initialProfile.location.latitude),
    location: initialProfile.location || { latitude: '', longitude: '' }
  } : {});
  const [musicData, setMusicData] = useState(initialProfile ? {
    genres: initialProfile.genres || [],
    artists: initialProfile.artists || [],
    tracks: initialProfile.tracks || []
  } : {});

  // Sauvegarde auto profil
  const handleProfileChange = d => {
    setProfileData(d);
    if (saveStep) saveStep(d, 'profile');
  };

  // Sauvegarde auto préférences
  const handleMusicChange = d => {
    setMusicData(d);
    if (saveStep) saveStep(d, 'music');
  };


  // Validation des champs requis pour chaque étape
  const isProfileValid = profileData.birthday && profileData.gender && ((profileData.useGPS && profileData.location && profileData.location.latitude && profileData.location.longitude) || (!profileData.useGPS && profileData.city));
  const isGenresValid = musicData.genres && musicData.genres.length > 0;
  const isArtistsValid = musicData.artists && musicData.artists.length > 0;
  const isTracksValid = musicData.tracks && musicData.tracks.length > 0;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  const handleFinish = () => {
    if (onComplete) onComplete({ ...profileData, ...musicData });
  };

  return (
    <div className="onboarding-wizard-overlay">
      <div className="onboarding-wizard-card">
        <div className="wizard-progress">
          <div className={`wizard-dot${step === 1 ? ' active' : ''}`}></div>
          <div className={`wizard-dot${step === 2 ? ' active' : ''}`}></div>
        </div>
        {step === 1 && (
          <div className="wizard-step">
            <PersonalProfileStep data={profileData} onChange={handleProfileChange} />
            <div className="wizard-nav">
              <button className="wizard-btn" onClick={() => { setStep(2); if (saveStep) saveStep(profileData, 'profile'); }} disabled={!isProfileValid}>Suivant</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="wizard-step">
            <MusicPreferencesForm data={musicData} onChange={handleMusicChange} />
            <div className="wizard-nav">
              <button className="wizard-btn" onClick={() => { setStep(1); if (saveStep) saveStep(musicData, 'music'); }}>Précédent</button>
              <button className="wizard-btn wizard-btn-primary" onClick={handleFinish} disabled={!isGenresValid || !isArtistsValid || !isTracksValid}>Valider</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
