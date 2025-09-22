import api from './api';

const parentService = {
  /**
   * Fetches the list of children for the logged-in parent
   * @returns {Promise<Array>} List of children
   */
  getMyChildren: async () => {
    try {
      const response = await api.get('/api/parent/children');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch children:', error);
      throw new Error('Failed to load children.');
    }
  },

  /**
   * Fetches dashboard data for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Object>} Dashboard data for the child
   */
  getDashboardData: async (childId) => {
    try {
      const response = await api.get(`/api/parent/children/${childId}/dashboard`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch dashboard data for child ${childId}:`, error);
      throw new Error('Failed to load dashboard data.');
    }
  },

  /**
   * Fetches attendance data for a specific child
   * @param {string} childId - The ID of the child
   * @param {Object} params - Query parameters (e.g., date range)
   * @returns {Promise<Object>} Attendance data for the child
   */
  getChildAttendance: async (childId, params = {}) => {
    try {
      const response = await api.get(`/api/parent/children/${childId}/attendance`, { 
        params 
      });
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch attendance for child ${childId}:`, error);
      throw new Error('Failed to load attendance data.');
    }
  },

  /**
   * Fetches upcoming events for a specific child or all events
   * @param {string|null} childId - The ID of the child (optional)
   * @returns {Promise<Array>} List of upcoming events
   */
  getUpcomingEvents: async (childId) => {
    try {
      const url = childId 
        ? `/api/parent/children/${childId}/events/upcoming`
        : '/api/parent/events/upcoming';
      
      const response = await api.get(url);
      return response.data?.events || [];
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      throw new Error('Failed to load upcoming events.');
    }
  },

  /**
   * Fetches announcements for parents
   * @returns {Promise<Array>} List of announcements
   */
  getAnnouncements: async () => {
    try {
      const response = await api.get('/api/announcements');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      throw new Error('Failed to load announcements.');
    }
  },

  /**
   * Fetches fee information for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Object>} Fee information for the child
   */
  getFeeInfo: async (childId) => {
    try {
      const response = await api.get(`/api/parent/children/${childId}/fees`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch fee info for child ${childId}:`, error);
      throw new Error('Failed to load fee information.');
    }
  },

  /**
   * Fetches academic reports for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Array>} List of academic reports
   */
  getChildAcademicReports: async (childId) => {
    try {
      const response = await api.get(`/api/parent/children/${childId}/reports`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch academic reports for child ${childId}:`, error);
      throw new Error('Failed to load academic reports.');
    }
  }
};

export default parentService;
