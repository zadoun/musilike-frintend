import React, { useEffect, useState } from 'react';
import API_URL from './api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import { createProfileIcon } from './ProfileMarker';
import 'leaflet/dist/leaflet.css';

export default function UsersMap({ onUserSelect, users: usersProp, currentUserId }) {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noToken, setNoToken] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Si usersProp fourni, pas de fetch interne
  useEffect(() => {
    if (usersProp) {
      setUsers(usersProp);
      setLoading(false);
      setNoToken(false);
      setError('');
      return;
    }
    // Surveille le token dans localStorage (ex: après login/logout)
    const checkToken = () => {
      const t = localStorage.getItem('token');
      setToken(t);
    };
    window.addEventListener('storage', checkToken);
    const interval = setInterval(checkToken, 500);
    return () => {
      window.removeEventListener('storage', checkToken);
      clearInterval(interval);
    };
  }, [usersProp]);

  useEffect(() => {
    if (usersProp) return;
    if (!token) {
      setNoToken(true);
      setLoading(false);
      setUsers([]);
      return;
    }
    setNoToken(false);
    setLoading(true);
    setError('');
    fetch(`${API_URL}/api/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setLoading(false);
      })
      .catch(() => { setError('Could not load users'); setLoading(false); });
  }, [token, usersProp]);

  // Default map center (Europe)
  const defaultCenter = [48.8588443, 2.2943506];

  // Only show users with valid coordinates
  const usersWithCoords = users.filter(
    u =>
      u.location &&
      typeof u.location.latitude === 'number' &&
      typeof u.location.longitude === 'number' &&
      !isNaN(u.location.latitude) &&
      !isNaN(u.location.longitude)
  );

  // Register React-Leaflet markers with the spiderfier
// Register React-Leaflet markers with the spiderfier
const markerRefs = React.useRef([]);
function RegisterSpiderfier({ markerRefs, usersWithCoords, onUserSelect }) {
  const map = useMap();
  const [spiderfier, setSpiderfier] = useState(null);

  // Store a ref to the click handler to avoid duplicate listeners
  const clickHandlerRef = React.useRef();

  useEffect(() => {
    if (!map) return;
    // Always destroy previous spiderfier before creating a new one
    if (spiderfier) {
      spiderfier.clearMarkers();
      if (spiderfier.removeListener && clickHandlerRef.current) {
        spiderfier.removeListener('click', clickHandlerRef.current);
      }
      setSpiderfier(null);
      console.log('[Spiderfier] Destroyed previous instance');
    }
    const OMS = window.OverlappingMarkerSpiderfier || L.OverlappingMarkerSpiderfier;
    if (OMS) {
      const s = new OMS(map, {
        keepSpiderfied: true,
        legLength: 80, // wider arms
        circleFootSeparation: 60 // more space between markers in circle
      });
      setSpiderfier(s);
      console.log('[Spiderfier] Initialized with wide spread');
      return () => {
        s.clearMarkers();
        if (s.removeListener && clickHandlerRef.current) {
          s.removeListener('click', clickHandlerRef.current);
        }
        console.log('[Spiderfier] Cleaned up');
      };
    } else {
      console.error('OverlappingMarkerSpiderfier is not available on window or L.\nYou must add <script src="https://unpkg.com/overlapping-marker-spiderfier-leaflet/oms.min.js"></script> to your public/index.html after Leaflet.');
    }
  }, [map]);

  useEffect(() => {
    if (!spiderfier) return;
    spiderfier.clearMarkers();
    markerRefs.current.forEach((ref, idx) => {
      // For React-Leaflet v3+, ref.current is the Leaflet marker instance
      const markerInstance = ref.current && (ref.current._leaflet_id ? ref.current : ref.current?.leafletElement);
      if (markerInstance && markerInstance._latlng) {
        // Attach userId to marker instance for lookup in click handler
        markerInstance._userId = usersWithCoords[idx]._id;
        spiderfier.addMarker(markerInstance);
        console.log('[Spiderfier] Registered marker', idx, markerInstance.getLatLng());
      }
    });
    // Log all marker coordinates for debugging
    const allCoords = markerRefs.current.map(ref => {
      const markerInstance = ref.current && (ref.current._leaflet_id ? ref.current : ref.current?.leafletElement);
      return markerInstance && markerInstance._latlng ? markerInstance.getLatLng() : null;
    });
    console.log('[Spiderfier] All marker coordinates:', allCoords);
    // Remove previous click handler if present
    if (clickHandlerRef.current && spiderfier.removeListener) {
      spiderfier.removeListener('click', clickHandlerRef.current);
    }
    // Add spiderfier click handler to show comparison card
    const handleSpiderfierClick = (marker) => {
      if (marker && marker._userId && onUserSelect) {
        onUserSelect(marker._userId);
      }
    };
    spiderfier.addListener('click', handleSpiderfierClick);
    clickHandlerRef.current = handleSpiderfierClick;
  }, [spiderfier, usersWithCoords, onUserSelect]);

  return null;
}


  if (loading) return <div>Loading map…</div>;
  if (noToken) return <div style={{ color: '#b44', fontWeight: 600, margin: '40px 0', textAlign: 'center' }}>Veuillez vous connecter pour voir la carte des utilisateurs.</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  // Affiche la carte même s'il n'y a aucun utilisateur
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
        {/* Render all markers as before */}
        {/* Prepare refs for all markers */}
        {usersWithCoords.map((user, idx) => {
          const isMe = currentUserId && user._id === currentUserId;
          if (!markerRefs.current[idx]) markerRefs.current[idx] = React.createRef();
          return (
            <Marker
              key={user._id}
              position={[user.location.latitude, user.location.longitude]}
              icon={createProfileIcon(
                user.profilePicture,
                isMe ? 'Me' : (user.compatibilityScore ?? null),
                64,
                isMe ? '#e74c3c' : undefined // red for 'me', gold default
              )}
              ref={markerRefs.current[idx]}
            />
          );
        })}
        <RegisterSpiderfier markerRefs={markerRefs} usersWithCoords={usersWithCoords} onUserSelect={onUserSelect} />
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
