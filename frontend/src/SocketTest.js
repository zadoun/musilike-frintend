import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function SocketTest() {
  useEffect(() => {
    const socket = io('http://localhost:4000', { transports: ['websocket'] });
    socket.on('connect', () => {
      console.log('Socket.IO TEST connected!', socket.id);
    });
    socket.on('disconnect', () => {
      console.log('Socket.IO TEST disconnected');
    });
    return () => socket.disconnect();
  }, []);
  return <div>Socket.IO Test Component</div>;
}
