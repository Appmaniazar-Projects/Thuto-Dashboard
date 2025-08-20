import React, { createContext, useContext, useState } from 'react';

const SystemMessageContext = createContext();

export const SystemMessageProvider = ({ children }) => {
  const [systemMessages] = useState([
    {
      id: 1,
      title: 'System Messages',
      content: 'This feature is coming soon!',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);

  const value = {
    systemMessages,
    loading: false,
    error: null,
    analytics: {
      totalMessages: 0,
      readRate: 0,
      responseRate: 0,
      byType: {}
    },
    markAsRead: () => {},
    fetchMessages: () => {},
    sendMessage: () => Promise.resolve({ success: true, message: 'This feature is coming soon!' })
  };

  return (
    <SystemMessageContext.Provider value={value}>
      {children}
    </SystemMessageContext.Provider>
  );
};

export const useSystemMessages = () => {
  const context = useContext(SystemMessageContext);
  if (!context) {
    throw new Error('useSystemMessages must be used within a SystemMessageProvider');
  }
  return context;
};
