import React, { useState, useEffect } from 'react';
import API_URL from './api';

export default function PersonalProfile() {
  const [editMode, setEditMode] = useState(false);
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [useGPS, setUseGPS] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load profile data
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);
    fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setBirthday(data.birthday ? data.birthday.substr(0, 10) : '');
        setGender(data.gender || 'prefer_not_to_say');
        setCity(data.city || '');
        setLocation(data.location || { latitude: '', longitude: '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setUseGPS(true);
      },
      err => {
        alert('Could not get your location.');
      }
    );
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
      body: JSON.stringify({
        birthday: birthday ? new Date(birthday) : null,
        gender,
        city: useGPS ? '' : city,
        location: useGPS ? location : { latitude: '', longitude: '' }
      })
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => {
        setSaveStatus('Saved');
        setEditMode(false);
      })
      .catch(() => setSaveStatus('Error'));
  };

  if (loading) return <div style={{marginTop: 40}}>Loading profile…</div>;

  return (
    <div style={{marginTop: 48, padding: 24, background: '#fafbfc', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto'}}>
      <h3 style={{marginBottom: 18}}>Personal Profile</h3>
      <form onSubmit={handleSave} style={{ textAlign: 'left' }}>
        <div style={{marginBottom: 18}}>
          <label style={{fontWeight: 600, marginRight: 16}}>
            Birthday:
            <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} disabled={!editMode} style={{marginLeft: 10}} />
          </label>
        </div>
        <div style={{marginBottom: 18}}>
          <label style={{fontWeight: 600, marginRight: 16}}>
            Gender:
            <select value={gender} onChange={e => setGender(e.target.value)} disabled={!editMode} style={{marginLeft: 10}}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
        </div>
        <div style={{marginBottom: 18}}>
          <label style={{fontWeight: 600, marginRight: 16}}>
            <input type="checkbox" checked={useGPS} onChange={e => {
              if (e.target.checked) handleGetGPS();
              else setUseGPS(false);
            }} disabled={!editMode} />
            &nbsp;Use my GPS location
          </label>
          {useGPS && location.latitude && location.longitude && (
            <span style={{marginLeft: 18, color: '#319795'}}>
              Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
            </span>
          )}
        </div>
        {!useGPS && (
          <div style={{marginBottom: 18}}>
            <label style={{fontWeight: 600, marginRight: 16}}>
              City:
              <input type="text" value={city} onChange={e => setCity(e.target.value)} disabled={!editMode} style={{marginLeft: 10}} placeholder="Your city" />
            </label>
          </div>
        )}
        {editMode ? (
          <>
            <button type="submit" style={{marginTop: 18, padding: '8px 32px', background: '#319795', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer'}}>Save</button>
            <button
              type="button"
              style={{marginTop: 18, marginLeft: 12, padding: '8px 32px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer'}}
              onClick={() => setEditMode(false)}
              aria-label="Cancel editing personal profile"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            style={{marginTop: 18, padding: '8px 32px', background: '#319795', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer'}}
            onClick={() => setEditMode(true)}
            aria-label="Edit personal profile"
          >
            Edit
          </button>
        )}
        {saveStatus && <span style={{marginLeft: 18, color: saveStatus==='Saved'?'green':'red', fontWeight: 600}}>{saveStatus==='Saved' ? 'Saved!' : 'Error saving'}</span>}
      </form>
    </div>
  );
}
