import api from './api';

const parentService = {
  /**
   * Fetches the parent's children
   * @returns {Promise<Array>} List of children
   * parent/{phoneNumber}/children
   */
  getMyChildren: async (phoneNumber) => {
    try {
      const response = await api.get(`/parent/${phoneNumber}/children`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch children:', error);
      throw new Error('Failed to load children. Please try again.');
    }
  },

/**
 * Fetches details for a specific child
 * @param {string} phoneNumber - The parent's phone number
 * @param {string} childId - The ID of the child
 * @returns {Promise<Object>} Child details
 */
getChildDetails: async (phoneNumber, childId) => {
  try {
    const response = await api.get(`/parent/${phoneNumber}/children/child/${childId}`);
    return response.data || {};
  } catch (error) {
    console.error(`Failed to fetch details for child ${childId}:`, error);
    throw new Error('Failed to load child details.');
  }
},

  /**
   * Fetches upcoming events for the parent's children
   * @param {string} [childId] - Optional child ID to filter events
   * @returns {Promise<Array>} List of upcoming events
   */
  getUpcomingEvents: async (childId) => {
    try {
      const url = childId 
        ? `/parent/children/${childId}/events/upcoming`
        : '/parent/events/upcoming';
      
      const response = await api.get(url);
      return response.data?.events || [];
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return []; // Return empty array instead of throwing to prevent UI breakage
    }
  },

  /**
   * Fetches announcements for parents
   * @returns {Promise<Array>} List of announcements
   */
  getAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      throw new Error('Failed to load announcements.');
    }
  },

  /**
   * Fetches fee information for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Object>} Fee information
   */
  getFeeInfo: async (childId) => {
    try {
      const response = await api.get(`/parent/children/${childId}/fees`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch fee info for child ${childId}:`, error);
      throw new Error('Failed to load fee information.');
    }
  },

  /**
   * Fetches academic reports for a specific child
   * @param {string} studentId - The ID of the student
   * @returns {Promise<Array>} List of academic reports
   */
  getChildAcademicReports: async (studentId) => {
    try {
      const response = await api.get(`/parent/${parentId}/students/${studentId}/reports`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch academic reports for child ${studentId}:`, error);
      throw new Error('Failed to load academic reports.');
    }
  }
};

export default parentService;
