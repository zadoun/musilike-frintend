import React, { useState } from 'react';
import './HamburgerMenu.css';

function HamburgerMenu({ onLogout }) {
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
          <button onClick={onLogout} className="menu-logout">Logout</button>
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
