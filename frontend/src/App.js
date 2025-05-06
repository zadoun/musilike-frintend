import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Auth from './Auth';
import HamburgerMenu from './HamburgerMenu';
import SpotifySearchBar from './SpotifySearchBar';
import Inbox from './Inbox';
import SentRecommendations from './SentRecommendations';
import MusicProfile from './MusicProfile';
import { io } from 'socket.io-client';

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


import API_URL from './api';

// ...other imports...

function App() {
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
  const [error, setError] = useState('');
  const [page, setPage] = React.useState('search');
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
        // Expect backend to return user._id
        setUser({ email: data.email, username: data.username, _id: data._id });
        console.log('User object after login:', { email: data.email, username: data.username, _id: data._id });
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

  return (
    <div className="App">
      {!user ? (
        <Auth onAuth={setUser} />
      ) : (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <HamburgerMenu onLogout={handleLogout} />
          <h2>Hi {user.username}!</h2>
          <nav style={{marginBottom: 24}}>
  <div className="top-menu">
    <button className="topbar-btn" onClick={() => setPage('search')}>Music Search</button>
    <button className="topbar-btn" onClick={() => {
      setPage('inbox');
      if (inboxBadge > 0) {
        setToast(`You have ${inboxBadge} new recommendation${inboxBadge > 1 ? 's' : ''} in your inbox!`);
      }
      setInboxBadge(0);
      localStorage.setItem('inboxBadgeCount', '0');
    }}>
      Inbox{inboxBadge > 0 && <span className="badge">{inboxBadge}</span>}
    </button>
    <button className="topbar-btn" onClick={() => {
      setPage('sent');
      setSentBadge(0);
      localStorage.setItem('sentBadgeCount', '0');
    }}>
      Sent{sentBadge > 0 && <span className="badge">{sentBadge}</span>}
    </button>
    <button className="topbar-btn topbar-btn-right" onClick={() => setPage('playlist')}>Liked Music</button>
  </div>
</nav>
          {page === 'search' && <SpotifySearchBar />}
          {page === 'playlist' && <MusicProfile />}
          {page === 'inbox' && <Inbox userId={user._id} refreshFlag={refreshInboxFlag} />}
          {page === 'sent' && <SentRecommendations userId={user._id} />}
        </div>
      )}
    {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
