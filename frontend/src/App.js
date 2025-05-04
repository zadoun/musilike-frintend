import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Auth from './Auth';
import HamburgerMenu from './HamburgerMenu';
import SpotifySearchBar from './SpotifySearchBar';
import Inbox from './Inbox';
import SentRecommendations from './SentRecommendations';
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


function App() {
  const [toast, setToast] = useState(null);
  const [inboxBadge, setInboxBadge] = useState(false);
  const [refreshInboxFlag, setRefreshInboxFlag] = useState(false); // Used to trigger inbox refresh

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
    fetch('http://localhost:4000/api/profile', {
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
        socketRef.current = io('http://localhost:4000', { transports: ['websocket'] });
        socketRef.current.on('connect', () => {
          console.log('Socket.IO connected!', socketRef.current.id);
        });
      }
      socketRef.current.emit('register', user._id);
      socketRef.current.on('new-recommendation', (data) => {
        console.log('Received new-recommendation event:', data);
        setToast('You have a new recommendation!');
        setInboxBadge(true);
        if (page === 'inbox') {
          setRefreshInboxFlag(f => !f); // Toggle to trigger refresh
        }
      });
      return () => {
        if (socketRef.current) {
          socketRef.current.off('new-recommendation');
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
            <button onClick={() => setPage('search')} style={{marginRight:12}}>Spotify Search</button>
            <button onClick={() => { setPage('inbox'); setInboxBadge(false); }} style={{marginRight:12}}>
              Inbox{inboxBadge && <span style={{
                display: 'inline-block',
                marginLeft: 8,
                background: '#e74c3c',
                color: '#fff',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 12,
                lineHeight: '18px',
                textAlign: 'center',
                fontWeight: 700
              }}>●</span>}
            </button>
            <button onClick={() => setPage('sent')}>
              Sent
            </button>
          </nav>
          {page === 'search' && <SpotifySearchBar />}
          {page === 'inbox' && <Inbox userId={user._id} refreshFlag={refreshInboxFlag} />}
          {page === 'sent' && <SentRecommendations userId={user._id} />}
        </div>
      )}
    {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
