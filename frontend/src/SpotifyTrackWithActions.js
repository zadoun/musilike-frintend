import React from 'react';
import MusilikeButton from './MusilikeButton';
import RecommendModal from './RecommendModal';

export default function SpotifyTrackWithActions({ track, musilikedIds, refreshMusilikedIds, onRecommend, showRecommend, style }) {
  const [recommendOpen, setRecommendOpen] = React.useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', ...style }}>
      {track.id && (
        <div className="spotify-embed-player">
          <iframe
            src={`https://open.spotify.com/embed/track/${track.id}`}
            width="280"
            height="80"
            frameBorder="0"
            allowtransparency="true"
            allow="encrypted-media"
            title={`Spotify Player for ${track.name}`}
            style={{ borderRadius: 8 }}
          />
        </div>
      )}
      <div className="spotify-search-result-actions" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 10, width: '100%' }}>
        {showRecommend && (
          <>
            <button
              className="recommend-btn"
              title="Recommend this song!"
              onClick={() => setRecommendOpen(true)}
              style={{ width: 130, height: 30, maxWidth: '90vw' }}
            >
              <span role="img" aria-label="music">🎵</span> <span style={{ fontSize: '0.95em', fontWeight: 600 }}>Recommend!</span>
            </button>
            <RecommendModal
              open={recommendOpen}
              onClose={() => setRecommendOpen(false)}
              track={track}
              onSend={() => setRecommendOpen(false)}
            />
          </>
        )}
        <MusilikeButton
          track={track}
          musilikedIds={musilikedIds}
          refreshMusilikedIds={refreshMusilikedIds}
          style={{ width: 160, height: 10, maxWidth: '90vw' }}
        />
      </div>
    </div>
  );
}
