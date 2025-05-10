import React, { useEffect, useState } from 'react';
import UsersMap from './UsersMap';
import Compatibility from './Compatibility';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import API_URL from './api';

export default function UsersMapWithCompatibility({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUsers((data.users || []).filter(u => u._id !== currentUserId));
      })
      .catch(() => setUsers([]));
  }, [currentUserId]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fafbfc' }}>
      <div style={{ margin: '38px auto 0 auto', maxWidth: 900 }}>
        <UsersMap onUserSelect={setSelectedUser} />
      </div>
      <div style={{ margin: '18px auto 0 auto', width: '100%', maxWidth: 440 }}>
        <Autocomplete
          disablePortal
          id="user-search-autocomplete"
          options={users}
          getOptionLabel={option => option.username || ''}
          sx={{ width: '100%', marginBottom: 2, background: '#fff', borderRadius: 1 }}
          value={users.find(u => u._id === selectedUser) || null}
          onChange={(event, newValue) => setSelectedUser(newValue ? newValue._id : '')}
          renderInput={(params) => <TextField {...params} label="Search user to compare" size="small" />}
          isOptionEqualToValue={(option, value) => option._id === value._id}
        />
      </div>
      <div style={{ margin: '24px auto 0 auto', width: '100%', maxWidth: 440 }}>
        <Compatibility
          currentUserId={currentUserId}
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      </div>
    </div>
  );
}
