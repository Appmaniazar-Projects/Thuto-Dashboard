import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [socket, setSocket] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // In a real app, you would connect to your WebSocket server
    // const ws = new WebSocket('wss://your-websocket-url');
    
    // Mock WebSocket implementation for development
    const mockWebSocket = {
      onopen: () => {},
      onmessage: () => {},
      onclose: () => {},
      close: () => {}
    };
    
    setSocket(mockWebSocket);
    
    // Simulate receiving a message
    const messageInterval = setInterval(() => {
      // Simulate receiving a new message occasionally
      if (Math.random() > 0.7) {
        const mockMessage = {
          type: 'new_message',
          data: {
            id: `msg-${Date.now()}`,
            type: 'message',
            title: 'New Message',
            message: 'You have a new message in your inbox',
            timestamp: new Date().toISOString(),
            read: false,
            metadata: {
              messageId: `msg-${Date.now()}`,
              sender: 'System',
              priority: 'normal'
            }
          }
        };
        handleNewNotification(mockMessage);
      }
    }, 30000); // Check every 30 seconds for demo purposes

    return () => {
      clearInterval(messageInterval);
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const handleNewNotification = useCallback((message) => {
    const notification = {
      id: message.data.id || `notif-${Date.now()}`,
      type: message.type || 'info',
      title: message.data.title || 'Notification',
      message: message.data.message,
      timestamp: message.data.timestamp || new Date().toISOString(),
      read: false,
      metadata: message.data.metadata || {}
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show snackbar for important notifications
    if (message.data.priority === 'high') {
      enqueueSnackbar(notification.message, {
        variant: 'info',
        autoHideDuration: 5000,
        action: (key) => (
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => {
              // Handle notification click
              markAsRead(notification.id);
              enqueueSnackbar.closeSnackbar(key);
            }}
          >
            View
          </Button>
        )
      });
    }
  }, [enqueueSnackbar]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification: handleNewNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
