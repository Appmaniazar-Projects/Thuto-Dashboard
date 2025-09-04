import api from './api';

/**
 * Student Profile
 */

export const getMyProfile = async () => {
  try {
    const response = await api.get('/student/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/student/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Failed to update student profile:', error);
    throw error;
  }
};

/**
 * Attendance
 */

export const getMyAttendance = async (params = {}) => {
  try {
    const response = await api.get('/student/attendance', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    throw error;
  }
};

export const getAttendanceStats = async () => {
  try {
    const response = await api.get('/student/attendance/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance stats:', error);
    throw error;
  }
};

/**
 * Resources
 */

export const getAvailableResources = async (filters = {}) => {
  try {
    const response = await api.get('/student/resources', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    throw error;
  }
};

export const downloadResource = async (resourceId, filename) => {
  try {
    const response = await api.get(`/student/resources/${resourceId}/download`, {
      responseType: 'blob',
    });
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `resource-${resourceId}`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading resource ${resourceId}:`, error);
    throw error;
  }
};

/**
 * Schedule & Timetable
 */

export const getMySchedule = async (params = {}) => {
  try {
    const response = await api.get('/student/schedule', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    throw error;
  }
};

export const getTimetable = async (weekStart) => {
  try {
    const params = weekStart ? { weekStart } : {};
    const response = await api.get('/student/timetable', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch timetable:', error);
    throw error;
  }
};


// Export all functions as default object
const studentService = {
  // Profile
  getMyProfile,
  updateProfile,
  
  // Attendance
  getMyAttendance,
  getAttendanceStats,
  
  // Resources
  getAvailableResources,
  downloadResource,
  
  // Schedule
  getMySchedule,
  getTimetable,
};

export default studentService;
