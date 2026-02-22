import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Socket listener for new notifications
  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification) => {
        handleNewNotification(notification);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await getNotifications({ limit: 50 });
      setNotifications(response.data);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 100));
    setUnreadCount(prev => prev + 1);

    // Show toast for important notifications
    if (notification.priority === 'high') {
      toast.custom((t) => (
        <div className="bg-cosmic-light border border-cosmic-accent rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'like' && '❤️'}
              {notification.type === 'comment' && '💬'}
              {notification.type === 'follow' && '👥'}
              {notification.type === 'mission' && '🚀'}
              {notification.type === 'achievement' && '🏆'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    const notification = notifications.find(n => n._id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    refreshNotifications: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
