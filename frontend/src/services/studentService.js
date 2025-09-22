import api from './api';

/**
 * Student Profile - Updated to match backend API structure
 */

export const getMyProfile = async (phoneNumber) => {
  try {
    const response = await api.get(`/student/${phoneNumber}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    throw error;
  }
};

export const updateProfile = async (studentData) => {
  try {
    const response = await api.put('/student/updateStudent', studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to update student profile:', error);
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
  
  // Resources
  getAvailableResources,
  downloadResource,
  
  // Schedule
  getMySchedule,
  getTimetable,
};

export default studentService;
