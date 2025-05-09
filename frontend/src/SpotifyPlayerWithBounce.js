import React, { useRef } from 'react';

// This component overlays a custom play button on the Spotify embed. When clicked, it triggers both the bounce and the Spotify play.
// Because Spotify's iframe does not allow JS API or postMessage, we simulate play by focusing/clicking the overlay button and letting the user click the real play button.

export default function SpotifyPlayerWithBounce({ trackUrl, onPlayBounce }) {
  const iframeRef = useRef(null);
  const [showOverlay, setShowOverlay] = React.useState(true);

  // Only show overlay until user clicks play
  const handleOverlayClick = () => {
    setShowOverlay(false);
    if (onPlayBounce) onPlayBounce();
    // Focus the iframe to help user immediately click play
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  };

  // Extract track ID
  const trackId = trackUrl.split('/track/')[1]?.split('?')[0];
  const src = `https://open.spotify.com/embed/track/${trackId}`;

  return (
    <div style={{ position: 'relative', margin: '12px 0 20px 0', width: 320, height: 90, textAlign: 'center' }}>
      <iframe
        ref={iframeRef}
        title="Spotify Player"
        src={src}
        width="320"
        height="90"
        frameBorder="0"
        allowtransparency="true"
        allow="encrypted-media"
        style={{ borderRadius: 8, margin: '0 auto', display: 'block', boxShadow: '0 2px 8px #0002' }}
        tabIndex={-1}
      />
      {showOverlay && (
        <button
          onClick={handleOverlayClick}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 320,
            height: 90,
            background: 'rgba(0,0,0,0.18)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            color: '#ffd700',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transition: 'background 0.18s',
          }}
          aria-label="Play preview"
        >
          ▶ Play Preview
        </button>
      )}
    </div>
  );
}
