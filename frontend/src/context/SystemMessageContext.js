import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const SystemMessageContext = createContext();

export const SystemMessageProvider = ({ children }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [systemMessages, setSystemMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    readRate: 0,
    responseRate: 0,
    byType: {},
    byRecipient: {}
  });

  // Fetch system messages
  const fetchSystemMessages = async () => {
    if (!user || !user.isAdmin) return;
    
    setLoading(true);
    try {
      const response = await api.get('/admin/system-messages');
      setSystemMessages(response.data);
    } catch (err) {
      setError('Failed to fetch system messages');
      console.error('Error fetching system messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!user || !user.isAdmin) return;
    
    try {
      const response = await api.get('/admin/messages/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching message analytics:', err);
    }
  };

  // Send system message
  const sendSystemMessage = async (messageData) => {
    try {
      const response = await api.post('/admin/system-messages', messageData);
      setSystemMessages(prev => [response.data, ...prev]);
      enqueueSnackbar('System message sent successfully', { variant: 'success' });
      return true;
    } catch (err) {
      enqueueSnackbar('Failed to send system message', { variant: 'error' });
      console.error('Error sending system message:', err);
      return false;
    }
  };

  // Create message template
  const createTemplate = async (templateData) => {
    try {
      await api.post('/admin/message-templates', templateData);
      enqueueSnackbar('Template created successfully', { variant: 'success' });
      return true;
    } catch (err) {
      enqueueSnackbar('Failed to create template', { variant: 'error' });
      console.error('Error creating template:', err);
      return false;
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user?.isAdmin) {
      fetchSystemMessages();
      fetchAnalytics();
    }
  }, [user]);

  return (
    <SystemMessageContext.Provider
      value={{
        systemMessages,
        loading,
        error,
        analytics,
        sendSystemMessage,
        createTemplate,
        refreshMessages: fetchSystemMessages,
        refreshAnalytics: fetchAnalytics
      }}
    >
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
