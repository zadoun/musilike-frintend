import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Auth from './Auth';
import HamburgerMenu from './HamburgerMenu';
import SpotifySearchBar from './SpotifySearchBar';
import Inbox from './Inbox';
import SentRecommendations from './SentRecommendations';
import MusicProfile from './MusicProfile';
import MusicPreferences from './MusicPreferences';
import PersonalProfile from './PersonalProfile';
import UsersMapWithCompatibility from './UsersMapWithCompatibility';
import OnboardingWizard from './OnboardingWizard';
import { io } from 'socket.io-client';
import API_URL from './api';

function Toast({ message, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      background: 'rgba(40,180,99,0.95)',
      color: '#fff',
      padding: '16px 28px',
      borderRadius: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      fontSize: '1.12em',
      zIndex: 9999
    }}>
      {message}
    </div>
  );
}


function App() {
  // Onglet actif pour la section Music
  const [musicTab, setMusicTab] = useState('search');
  const [musilikedRefreshFlag, setMusilikedRefreshFlag] = useState(false);
  const [page, setPage] = useState('search');
  const toggleMusilikedRefreshFlag = () => setMusilikedRefreshFlag(f => !f);
  const [toast, setToast] = useState(null);
  const [inboxBadge, setInboxBadge] = useState(() => {
    const stored = localStorage.getItem('inboxBadgeCount');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [refreshInboxFlag, setRefreshInboxFlag] = useState(false); // Used to trigger inbox refresh
  const [sentBadge, setSentBadge] = useState(() => {
    const stored = localStorage.getItem('sentBadgeCount');
    return stored ? parseInt(stored, 10) : 0;
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileRaw, setProfileRaw] = useState(null); // pour onboarding

  const socketRef = useRef(null);

  // On mount, check for JWT and fetch profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(async res => {
        if (!res.ok) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProfileRaw(data);
        setUser({ email: data.email, username: data.username, _id: data._id });
        // Affiche le wizard uniquement si onboarded n'est pas true
        if (data.onboarded === true) {
          setShowOnboarding(false);
        } else if (
          !data.birthday ||
          !data.gender ||
          data.gender === 'prefer_not_to_say' ||
          (!data.city && !(data.location && data.location.latitude)) ||
          !data.genres || !Array.isArray(data.genres) || data.genres.length === 0
        ) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Socket.IO connect and event listener
  useEffect(() => {
    if (user && user._id) {
      if (!socketRef.current) {
        socketRef.current = io(API_URL, { transports: ['websocket', 'polling'] });
        socketRef.current.on('connect', () => {
          console.log('Socket.IO connected!', socketRef.current.id);
        });
      }
      console.log('Registering socket with userId', user._id);
      socketRef.current.emit('register', user._id);
      socketRef.current.on('new-recommendation', (data) => {
        console.log('Received new-recommendation event:', data);
        setInboxBadge(prev => {
          const next = (prev || 0) + 1;
          localStorage.setItem('inboxBadgeCount', next);
          return next;
        });
        setToast(`New recommendation from ${data.fromUser}${data.track ? ': ' + data.track.name : ''}!`);
        setRefreshInboxFlag(f => !f); // Toggle to trigger refresh
      });
      socketRef.current.on('recommendation-reacted', (data) => {
        setToast('Your recommendation just got a reaction!');
        setSentBadge(prev => {
          const next = (prev || 0) + 1;
          localStorage.setItem('sentBadgeCount', next);
          return next;
        });
      });
      return () => {
        if (socketRef.current) {
          socketRef.current.off('new-recommendation');
          socketRef.current.off('recommendation-reacted');
        }
      };
    }
  }, [user]);


  if (loading) return <div>Loading...</div>;

  // Affichage du wizard si besoin
  if (showOnboarding && user) {
    return (
      <div className="App">
        <OnboardingWizard
          onComplete={async (allData) => {
            // Sépare profil et préférences musicales
            const { birthday, gender, city, useGPS, location, genres, artists, tracks } = allData;
            const token = localStorage.getItem('token');
            // 1. Sauvegarde profil
            let finalLocation = useGPS ? location : undefined;
            if (!useGPS && city) {
              // Géocodage de la ville
              try {
                const resp = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`);
                const data = await resp.json();
                if (data && data.length > 0) {
                  finalLocation = {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                  };
                }
              } catch (err) { /* ignore geocode errors */ }
            }
            await fetch(`${API_URL}/api/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
              },
              body: JSON.stringify({
                birthday: birthday ? new Date(birthday) : null,
                gender,
                city: useGPS ? '' : city,
                location: finalLocation
              })
            });
            // 2. Sauvegarde préférences musicales (genres, artistes, tracks)
            // Genres
            await fetch(`${API_URL}/api/profile/genres`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
              },
              body: JSON.stringify({ genres })
            });
            // Artistes
            await fetch(`${API_URL}/api/profile/artistes`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
              },
              body: JSON.stringify({ artistes: artists })
            });
            // Tracks (ajout dans la table musilikeds)
            for (const trackId of tracks) {
              try {
                await fetch(`${API_URL}/api/musiliked`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                  },
                  body: JSON.stringify({ trackId })
                });
              } catch (err) { /* ignore errors for now */ }
            }
            // Marque l'utilisateur comme onboarded
            await fetch(`${API_URL}/api/profile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
              },
              body: JSON.stringify({ onboarded: true })
            });
            // Re-fetch profil pour activer l’app
            fetch(`${API_URL}/api/profile`, {
              headers: { 'Authorization': 'Bearer ' + token }
            })
              .then(res => res.ok ? res.json() : null)
              .then(data => {
                setProfileRaw(data);
                setUser({ email: data.email, username: data.username, _id: data._id });
                setShowOnboarding(false);
              });
          }}
          // Sauvegarde automatique à chaque étape
          saveStep={async (stepData, stepType) => {
            const token = localStorage.getItem('token');
            if (!token) return;
            if (stepType === 'profile') {
              await fetch(`${API_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                  birthday: stepData.birthday ? new Date(stepData.birthday) : null,
                  gender: stepData.gender,
                  city: stepData.useGPS ? '' : stepData.city,
                  location: stepData.useGPS ? stepData.location : undefined
                })
              });
            } else if (stepType === 'music') {
              await fetch(`${API_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                  genres: stepData.genres,
                  artists: stepData.artists,
                  tracks: stepData.tracks
                })
              });
            }
          }}
          initialProfile={profileRaw}
        />
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <Auth onAuth={setUser} />
      ) : (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <HamburgerMenu
            onLogout={handleLogout}
            onPreferences={() => setPage('preferences')}
            onPersonalProfile={() => setPage('personal-profile')}
            onUsersMap={() => setPage('users-map')}
          />
          <h2>Hi {user.username}!</h2>
          <nav style={{marginBottom: 24}}>
  <div className="top-menu">
    <button className="topbar-btn" onClick={() => setPage('users-map')}>Music Mates</button>
    <button className="topbar-btn" onClick={() => setPage('music')}>Share Music</button>
    <button className="topbar-btn topbar-btn-right" onClick={() => setPage('playlist')}>Liked Music</button>
    {/* <button className="topbar-btn topbar-btn-right" onClick={() => setPage('compatibility')}>Compatibility</button> */}
  </div>
</nav>
          {/* Onglets contextuels pour la section Music */}
          {page === 'music' && (
            <div className="music-tabs" style={{ display: 'flex', gap: 8, marginBottom: 18, justifyContent: 'center' }}>
              <button className="music-tab-btn" onClick={() => setMusicTab('search')} style={{ fontWeight: musicTab === 'search' ? 700 : 400 }}>Search</button>
              <button className="music-tab-btn" onClick={() => { setMusicTab('inbox'); setInboxBadge(0); localStorage.setItem('inboxBadgeCount', '0'); }} style={{ fontWeight: musicTab === 'inbox' ? 700 : 400 }}>
                Inbox{inboxBadge > 0 && <span className="badge">{inboxBadge}</span>}
              </button>
              <button className="music-tab-btn" onClick={() => { setMusicTab('sent'); setSentBadge(0); localStorage.setItem('sentBadgeCount', '0'); }} style={{ fontWeight: musicTab === 'sent' ? 700 : 400 }}>
                Sent{sentBadge > 0 && <span className="badge">{sentBadge}</span>}
              </button>
            </div>
          )}
          {/* Affichage du contenu selon le tab sélectionné */}
          {page === 'music' && musicTab === 'search' && <SpotifySearchBar onMusilikedChange={toggleMusilikedRefreshFlag} />}
          {page === 'music' && musicTab === 'inbox' && <Inbox userId={user._id} refreshFlag={refreshInboxFlag} />}
          {page === 'music' && musicTab === 'sent' && <SentRecommendations userId={user._id} />}
          {page === 'playlist' && <MusicProfile musilikedRefreshFlag={musilikedRefreshFlag} />}
          {page === 'preferences' && <MusicPreferences />}
          {page === 'personal-profile' && <PersonalProfile />}
          {page === 'users-map' && user && user._id && <UsersMapWithCompatibility currentUserId={user._id} />}
        </div>
      )}
    {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
