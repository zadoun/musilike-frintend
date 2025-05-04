import React, { useState } from 'react';
import './App.css';
import Auth from './Auth';
import HamburgerMenu from './HamburgerMenu';
import SpotifySearchBar from './SpotifySearchBar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // On mount, check for JWT and fetch profile
  React.useEffect(() => {
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
        setUser({ email: data.email, username: data.username });
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="App">
      {!user ? (
        <Auth onAuth={setUser} />
      ) : (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <HamburgerMenu onLogout={handleLogout} />
          <h2>Hi {user.username}!</h2>
          <SpotifySearchBar />
        </div>
      )}
    </div>
  );
}

export default App;
