// src/hooks.js
// Custom hook to fetch sent recommendations for a user
import { useEffect, useState } from 'react';
import API_URL from './api';

export function useSentRecommendations(recipientId) {
  const [sentTrackIds, setSentTrackIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!recipientId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/recommendations/sent`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(async res => {
        if (!res.ok) {
          setError('Could not fetch sent recommendations');
          setLoading(false);
          return;
        }
        const data = await res.json();
        // Only keep trackIds sent to this recipientId
        const filtered = (data.sent || []).filter(r => (r.toUser && (r.toUser._id === recipientId || r.toUser.id === recipientId)));
        setSentTrackIds(filtered.map(r => r.track && (r.track.id || r.track._id || r.track.trackId)).filter(Boolean));
        setLoading(false);
      })
      .catch(() => {
        setError('Could not fetch sent recommendations');
        setLoading(false);
      });
  }, [recipientId]);

  return { sentTrackIds, loading, error };
}
