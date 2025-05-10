import React from 'react';
import UsersMap from './UsersMap';
import Compatibility from './Compatibility';

export default function UsersMapWithCompatibility({ currentUserId }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fafbfc' }}>
      <div style={{ margin: '38px auto 0 auto', maxWidth: 900 }}>
        <UsersMap />
      </div>
      <div style={{ margin: '48px auto 0 auto', width: '100%', maxWidth: 440 }}>
        <Compatibility currentUserId={currentUserId} />
      </div>
    </div>
  );
}
