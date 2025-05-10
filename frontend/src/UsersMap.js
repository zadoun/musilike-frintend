import React, { useEffect, useState } from 'react';
import API_URL from './api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createProfileIcon } from './ProfileMarker';
import 'leaflet/dist/leaflet.css';

export default function UsersMap({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all users with location
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);
    fetch(`${API_URL}/api/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setLoading(false);
      })
      .catch(() => { setError('Could not load users'); setLoading(false); });
  }, []);

  // Default map center (Europe)
  const defaultCenter = [48.8588443, 2.2943506];

  // Only show users with valid coordinates
  const usersWithCoords = users.filter(u => u.location && u.location.latitude && u.location.longitude);

  if (loading) return <div>Loading map…</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (usersWithCoords.length === 0) return <div>No users with location to display.</div>;

  return (
    <div
      style={{
        margin: '32px auto',
        width: '100%',
        maxWidth: 440,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        padding: '0',
        boxSizing: 'border-box',
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={4}
        style={{
          width: '100%',
          height: '56vw', // Responsive height, max ~440px
          maxHeight: 440,
          minHeight: 260,
          borderRadius: 12,
          transition: 'height 0.2s',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {usersWithCoords.map(user => (
          <Marker
            key={user._id}
            position={[user.location.latitude, user.location.longitude]}
            icon={createProfileIcon(user.profilePicture, user.compatibilityScore ?? null)}
            eventHandlers={{
              click: () => onUserSelect && onUserSelect(user._id)
            }}
          />
        ))}
      </MapContainer>
      <style>{`
        @media (max-width: 600px) {
          .leaflet-container {
            min-height: 220px !important;
            height: 54vw !important;
            border-radius: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
