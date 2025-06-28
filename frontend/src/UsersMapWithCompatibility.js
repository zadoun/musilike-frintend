import React, { useEffect, useState } from 'react';
import UsersMap from './UsersMap';
import Compatibility from './Compatibility';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import API_URL from './api';

import MusicMatesFilters from './MusicMatesFilters';
import './MusicMatesFilters.css';

export default function UsersMapWithCompatibility({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Filtres Music Mates
  const [compatibility, setCompatibility] = useState([0, 100]); // 0-100% par défaut
  const [genres, setGenres] = useState([]);
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState([18, 99]);
  const [musicianTypes, setMusicianTypes] = useState([]); // ex: ["Guitariste", "Chanteur"]
  const [minLevel, setMinLevel] = useState(1);

  // Filtrage local
  const filteredUsers = users.filter(u => {
    // Compatibilité (utilise la même propriété que sur la carte)
    const score = u.compatibilityScore ?? u.compatibility;
    if (score !== undefined && (score < compatibility[0] || score > compatibility[1])) return false;
    // Genres musicaux
    if (genres.length > 0 && (!u.genres || !genres.some(g => (u.genres || []).includes(g)))) return false;
    // Genre utilisateur
    // Si aucun genre sélectionné OU 'peu importe', on accepte tout le monde
    // Sinon, on filtre strictement
    if (gender && gender !== 'peu import' && u.gender !== gender) return false;
    // Age (suppose champ u.birthday ou u.age)
    if (u.birthday) {
      const birthYear = new Date(u.birthday).getFullYear();
      const thisYear = new Date().getFullYear();
      const age = thisYear - birthYear;
      if (age < ageRange[0] || age > ageRange[1]) return false;
    }
    // Musicien/instrument
    if (musicianTypes.length > 0) {
      if (!u.musicSkills) return false;
      // Correction : gestion chanteur (singerLevel) et instruments (tableau), mode "OU"
      const levelMap = { beginner: 1, "intermediate-": 2, intermediate: 3, advanced: 4, pro: 5 };
      let found = false;
      for (const instr of musicianTypes) {
        if (instr === "Chanteur") {
          // Chanteur : check isSinger + singerLevel
          if (u.musicSkills.isSinger) {
            const userLevel = levelMap[(u.musicSkills.singerLevel || '').toLowerCase()] || 0;
            if (userLevel >= minLevel) {
              found = true;
              break;
            }
          }
        } else {
          // Instruments : check dans instruments[]
          const instrumentMap = {
            "Guitarist": "Guitar",
            "Singer": "Singer",
            "Drummer": "Drums",
            "Pianist": "Piano",
            "Bassist": "Bass",
            "Violinist": "Violin",
            "DJ": "DJ",
            "Saxophonist": "Saxophone",
            "Trumpeter": "Trumpet",
            "Producer": "Producer",
            "Rapper": "Rapper"
          };
          const wanted = instrumentMap[instr];
          if (!wanted) continue;
          if (u.musicSkills.instruments && Array.isArray(u.musicSkills.instruments)) {
            const match = u.musicSkills.instruments.find(i =>
              (i.name || '').toLowerCase() === wanted.toLowerCase() &&
              levelMap[(i.level || '').toLowerCase()] >= minLevel
            );
            if (match) {
              found = true;
              break;
            }
          }
        }
      }
      if (!found) return false;
    }
    return true;
  });

  // Surveille le token dans localStorage (ex: après login/logout)
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUsers(data.users || []);
    // Debug: log users array after fetch
    if (Array.isArray(data.users)) {
      console.debug('[UsersMapWithCompatibility] Users fetched from backend:', data.users);
    }
      })
      .catch(() => setUsers([]));
  }, [currentUserId, token]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fafbfc' }}>
      <div style={{ margin: '38px auto 0 auto', maxWidth: 900 }}>
        <MusicMatesFilters
          compatibility={compatibility}
          onCompatibilityChange={setCompatibility}
          genres={genres}
          onGenresChange={setGenres}
          gender={gender}
          onGenderChange={setGender}
          ageRange={ageRange}
          onAgeRangeChange={setAgeRange}
          musicianTypes={musicianTypes}
          onMusicianTypesChange={setMusicianTypes}
          minLevel={minLevel}
          onMinLevelChange={setMinLevel}
          onReset={() => {
            setCompatibility([0, 100]);
            setGenres([]);
            setGender("");
            setAgeRange([18, 99]);
            setMusicianTypes([]);
            setMinLevel(1);
          }}
        />
        <div style={{marginBottom:8, color:'#888', fontSize:15}}>
          Utilisateurs affichés : {filteredUsers.length}
        </div>
        {/* Debug: log currentUserId and user IDs */}
        {(() => {
          console.debug('[UsersMapWithCompatibility] currentUserId:', currentUserId);
          console.debug('[UsersMapWithCompatibility] users:', users.map(u => u._id));
          console.debug('[UsersMapWithCompatibility] filteredUsers:', filteredUsers.map(u => u._id));
          const me = users.find(u => u._id === currentUserId);
          if (!me) console.warn('[UsersMapWithCompatibility] Current user not found in users array!');
          else if (!filteredUsers.some(u => u._id === currentUserId)) console.warn('[UsersMapWithCompatibility] Current user not present in filteredUsers, will be appended.');
        })()}
        {/* Ensure current user is always shown on the map */}
        <UsersMap
          onUserSelect={setSelectedUser}
          users={(() => {
            if (!currentUserId) return filteredUsers;
            // Find current user in the full users array
            const me = users.find(u => u._id === currentUserId);
            if (!me) return filteredUsers;
            // If already present, return as is
            if (filteredUsers.some(u => u._id === currentUserId)) return filteredUsers;
            // Otherwise, add current user to the list
            return [...filteredUsers, me];
          })()}
          currentUserId={currentUserId}
        />
      </div>
      <div style={{ margin: '18px auto 0 auto', width: '100%', maxWidth: 440 }}>
        <Autocomplete
          disablePortal
          id="user-search-autocomplete"
          options={filteredUsers}
          getOptionLabel={option => option.username || ''}
          sx={{ width: '100%', marginBottom: 2, background: '#fff', borderRadius: 1 }}
          value={filteredUsers.find(u => u._id === selectedUser) || null}
          onChange={(event, newValue) => setSelectedUser(newValue ? newValue._id : '')}
          renderInput={(params) => <TextField {...params} label="Search user to compare" size="small" />}
          isOptionEqualToValue={(option, value) => option._id === value._id}
        />
      </div>
      <div style={{ margin: '24px auto 0 auto', width: '100%', maxWidth: 440 }}>
        <Compatibility
          currentUserId={currentUserId}
          users={filteredUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      </div>
    </div>
  );
}
