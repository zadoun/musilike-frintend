import React, { useState } from 'react';
import './HamburgerMenu.css';

function HamburgerMenu({ onLogout, onPreferences, onPersonalProfile, onUsersMap }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="hamburger-menu">
      <button className="hamburger-icon" onClick={() => setOpen(!open)} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className="menu-dropdown">

          <button onClick={() => { setOpen(false); onPersonalProfile && onPersonalProfile(); }} className="menu-item">Personal Profile</button>
          <button onClick={() => { setOpen(false); onPreferences && onPreferences(); }} className="menu-item">Music Preferences</button>
          <button onClick={() => { setOpen(false); onLogout && onLogout(); }} className="menu-logout">Logout</button>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
