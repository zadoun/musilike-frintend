import React, { useEffect, useState } from 'react';
import API_URL from './api';

export default function SentRecommendations({ userId }) {
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
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
        setSent(data.sent || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not fetch sent recommendations');
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading sent recommendations...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!sent.length) return <div>No sent recommendations yet.</div>;

  // Sort by most recent (createdAt descending)
  const sorted = [...sent].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <h3>Sent Recommendations</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sorted.map(rec => (
          <li key={rec._id} style={{ marginBottom: 24, border: '1px solid #eee', borderRadius: 10, padding: 16, background: '#f9f9f9' }}>
            <div style={{ fontWeight: 600, fontSize: '1.08em' }}>
              To: {rec.toUser?.username || rec.toUser?.email || 'Unknown'}
            </div>
            <div style={{ margin: '8px 0' }}>
              <span style={{ color: '#888' }}>Message:</span> {rec.message}
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: '#888' }}>Track:</span> {rec.track?.name} by {rec.track?.artists?.map(a => a.name).join(', ')}
            </div>
            {rec.reaction && (rec.reaction.emoji || rec.reaction.text) ? (
              <div style={{ marginTop: 8, padding: 8, background: '#eafaf1', borderRadius: 8, color: '#27ae60' }}>
                <b>Reaction:</b> <span style={{ fontSize: 20 }}>{rec.reaction.emoji}</span>
                {rec.reaction.text && (
                  <span style={{ marginLeft: 8, color: '#555', fontStyle: 'italic' }}>
                    "{rec.reaction.text}"
                  </span>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 8, color: '#aaa', fontStyle: 'italic' }}>
                No reaction yet.
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
