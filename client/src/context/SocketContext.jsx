import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket
      const socketInstance = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Join user's personal room
        socketInstance.emit('join-user-room', user._id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('notification', (notification) => {
        toast.custom((t) => (
          <div className="bg-cosmic-light border border-cosmic-primary rounded-lg p-4 shadow-lg">
            <p className="text-white">{notification.message}</p>
          </div>
        ));
      });

      socketInstance.on('mission-updated', (mission) => {
        toast.success(`Mission ${mission.name} status updated!`);
      });

      socketInstance.on('new-comment', (comment) => {
        toast('New comment on your post');
      });

      socketInstance.on('role-updated', (data) => {
        toast(`Your role has been updated to ${data.newRole}`);
        // Refresh user data
        window.location.reload();
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const joinRoom = (room) => {
    if (socket && connected) {
      socket.emit('join-room', room);
    }
  };

  const leaveRoom = (room) => {
    if (socket && connected) {
      socket.emit('leave-room', room);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        emit,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
