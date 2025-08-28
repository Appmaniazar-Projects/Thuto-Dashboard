import api from './api';

const parentService = {
  /**
   * Fetches the parent's children
   * @returns {Promise<Array>} List of children
   */
  getMyChildren: async () => {
    try {
      const response = await api.get('/api/parent/children');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch children:', error);
      throw new Error('Failed to load children. Please try again.');
    }
  },

  /**
   * Fetches dashboard data for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Object>} Dashboard data
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
   * Fetches attendance records for a specific child
   * @param {string} childId - The ID of the child
   * @param {Object} [params] - Query parameters (e.g., { month: 1, year: 2023 })
   * @returns {Promise<Object>} Attendance data
   */
  getChildAttendance: async (childId, params = {}) => {
    try {
      const response = await api.get(`/api/parent/children/${childId}/attendance`, { 
        params 
      });
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch attendance for child ${childId}:`, error);
      throw new Error('Failed to load attendance records.');
    }
  },

  /**
   * Fetches academic reports for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Array>} List of academic reports
   */
  getChildReports: async (childId) => {
    try {
      const response = await api.get(`/api/parent/children/${childId}/reports`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch reports for child ${childId}:`, error);
      throw new Error('Failed to load academic reports.');
    }
  },

  /**
   * Downloads a specific report
   * @param {string} reportId - The ID of the report to download
   * @returns {Promise<Blob>} The report file
   */
  downloadReport: async (reportId) => {
    try {
      const response = await api.get(`/api/parent/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to download report ${reportId}:`, error);
      throw new Error('Failed to download report. Please try again.');
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
        ? `/api/parent/children/${childId}/events/upcoming`
        : '/api/parent/events/upcoming';
      
      const response = await api.get(url);
      return response.data?.events || [];
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return []; // Return empty array instead of throwing to prevent UI breakage
    }
  },

  /**
   * Fetches recent announcements
   * @param {number} [limit=5] - Maximum number of announcements to fetch
   * @returns {Promise<Array>} List of announcements
   */
  getAnnouncements: async (limit = 5) => {
    try {
      const response = await api.get('/api/announcements', {
        params: { limit, type: 'parent' }
      });
      return response.data?.announcements || [];
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      return []; // Return empty array instead of throwing to prevent UI breakage
    }
  },

  /**
   * Fetches fee information for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Object>} Fee information
   */
  getFeeInfo: async (childId) => {
    try {
      const response = await api.get(`/api/parent/children/${childId}/fees`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch fee info for child ${childId}:`, error);
      throw new Error('Failed to load fee information.');
    }
  }
};

export default parentService;
