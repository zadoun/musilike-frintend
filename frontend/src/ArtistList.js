import React, { useEffect, useState } from 'react';
import API_URL from './api';

/**
 * Affiche la liste mixée d'artistes (Spotify + statique) pour un genre donné.
 * @param {string} genre - Le genre musical sélectionné
 */
function ArtistList({ genre }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!genre) return;
    setLoading(true);
    setError('');
    fetch(`${API_URL}/api/spotify/mixed-artists-by-genre?genre=${encodeURIComponent(genre)}`)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Erreur serveur');
        }
        return res.json();
      })
      .then(data => {
        setArtists(data.artists || data || []);
      })
      .catch(err => {
        setError('Impossible de charger les artistes: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, [genre]);

  if (!genre) return null;
  if (loading) return <div>Chargement des artistes...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!artists.length) return <div>Aucun artiste trouvé pour ce genre.</div>;

  return (
    <ul style={{margin: '1em 0', padding: 0, listStyle: 'none'}}>
      {artists.map(artist => (
        <li key={artist.id || artist.name} style={{marginBottom: 8, color: '#111', fontWeight: 500}}>
          {artist.name}
        </li>
      ))}
    </ul>
  );
}

export default ArtistList;
