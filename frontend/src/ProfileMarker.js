import React from 'react';
import L from 'leaflet';

// Creates a custom Leaflet icon with a profile image inside a pin
// profilePicture: string (url)
// score: number | string | null ('Me' for current user)
// size: number (px)
// color: string (optional, hex)
export function createProfileIcon(profilePicture, score = null, size = 64, color) {
  // Fallback image if none
  const fallback = 'https://ui-avatars.com/api/?name=U&background=aaa&color=fff&size=128';
  const imgSrc = profilePicture || fallback;

  // Score or label text (if provided)
  let scoreHtml = '';
  let markerColor = color || '#C89B2C';
  let labelColor = '#C89B2C';
  let label = null;
  if (score !== null) {
    if (score === 'Me') {
      label = 'Me';
      markerColor = color || '#e74c3c'; // red
      labelColor = '#e74c3c';
      scoreHtml = `<div style="position:absolute;left:0;right:0;top:-25px;text-align:center;font-size:1.5em;font-weight:700;color:${labelColor};text-shadow:0 2px 8px #fff9;">Me</div>`;
    } else {
      scoreHtml = `<div style="position:absolute;left:0;right:0;top:-25px;text-align:center;font-size:1.5em;font-weight:700;color:${labelColor};text-shadow:0 2px 8px #fff9;">${score}%</div>`;
    }
  }

  // SVG marker with circular image
  const svg = `
    <div style="position:relative;width:${size}px;height:${size*1.4}px;">
      ${scoreHtml}
      <svg width="${size}" height="${size * 1.1}" viewBox="0 0 ${size} ${size * 1.4}" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path d="M${size/1.8},${size * 1.35} C${size*0.1},${size*0.8} 0,${size*0.5} ${size/2},${size*0.1} C${size},${size*0.5} ${size*0.9},${size*0.8} ${size/2},${size*1.35} Z" fill="${markerColor}" stroke="${markerColor}" stroke-width="2"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size/2-4}" fill="#fff" stroke="${markerColor}" stroke-width="4" />
          <clipPath id="clip">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2-6}" />
          </clipPath>
          <image href="${imgSrc}" x="6" y="6" width="${size-12}" height="${size-12}" clip-path="url(#clip)" preserveAspectRatio="xMidYMid slice" />
        </g>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [size, size * 1.6],
    iconAnchor: [size/2, size * 1.3],
    popupAnchor: [0, -size/2]
  });
}

