import api from './api';

const messageService = {
  // System Messages
  getSystemMessages: async () => {
    try {
      const response = await api.get('/admin/system-messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching system messages:', error);
      throw error;
    }
  },

  sendSystemMessage: async (messageData) => {
    try {
      const response = await api.post('/admin/system-messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending system message:', error);
      throw error;
    }
  },

  deleteSystemMessage: async (messageId) => {
    try {
      await api.delete(`/admin/system-messages/${messageId}`);
      return true;
    } catch (error) {
      console.error('Error deleting system message:', error);
      throw error;
    }
  },

  // Message Templates
  getTemplates: async () => {
    try {
      const response = await api.get('/admin/message-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/admin/message-templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await api.put(`/admin/message-templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  deleteTemplate: async (templateId) => {
    try {
      await api.delete(`/admin/message-templates/${templateId}`);
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Analytics
  getMessageAnalytics: async () => {
    try {
      const response = await api.get('/admin/messages/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching message analytics:', error);
      throw error;
    }
  },

  // Message Status
  updateMessageStatus: async (messageId, statusData) => {
    try {
      const response = await api.patch(`/messages/${messageId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  },

  // Broadcast
  broadcastMessage: async (messageData) => {
    try {
      const response = await api.post('/admin/broadcast', messageData);
      return response.data;
    } catch (error) {
      console.error('Error broadcasting message:', error);
      throw error;
    }
  },

  // Emergency Alerts
  sendEmergencyAlert: async (alertData) => {
    try {
      const response = await api.post('/admin/emergency-alerts', {
        ...alertData,
        priority: 'urgent',
        isEmergency: true
      });
      return response.data;
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      throw error;
    }
  },

  // Message Search
  searchMessages: async (queryParams) => {
    try {
      const response = await api.get('/messages/search', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  },

  // Bulk Actions
  bulkUpdateMessages: async (messageIds, updateData) => {
    try {
      const response = await api.patch('/messages/bulk-update', {
        messageIds,
        ...updateData
      });
      return response.data;
    } catch (error) {
      console.error('Error performing bulk update:', error);
      throw error;
    }
  },

  // Message Statistics
  getMessageStatistics: async (timeRange = '30d') => {
    try {
      const response = await api.get('/admin/messages/statistics', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching message statistics:', error);
      throw error;
    }
  }
};

export default messageService;
