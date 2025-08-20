import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications] = useState([
    {
      id: 'coming-soon',
      type: 'info',
      title: 'Notifications',
      message: 'This feature is coming soon!',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);
  
  const [unreadCount] = useState(0);
  const [isConnected] = useState(false);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead: () => {},
    clearAll: () => {},
    subscribe: () => {},
    unsubscribe: () => {}
  };

  return (
    <NotificationContext.Provider value={value}>
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
