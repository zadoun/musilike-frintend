import React, { useState } from 'react';
import './Auth.css';

function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email, password }
        : { email, password, username };
      const res = await fetch(`http://localhost:4000${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        return;
      }
      if (isLogin) {
        localStorage.setItem('token', data.token);
        onAuth && onAuth({ email: data.email, username: data.username });
      } else {
        setIsLogin(true);
        setSuccess('Registration successful! Please log in.');
        setError('');
        setEmail('');
        setPassword('');
        setUsername('');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <div className="toggle-auth">
        {isLogin ? (
          <span>
            New here?{' '}
            <button onClick={() => setIsLogin(false)}>Sign Up</button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button onClick={() => setIsLogin(true)}>Login</button>
          </span>
        )}
      </div>
    </div>
  );
}

export default Auth;
