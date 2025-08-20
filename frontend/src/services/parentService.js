import api from './api';

/**
 * Fetches the children associated with the logged-in parent.
 * The schoolId is automatically added by the api interceptor.
 */
export const getMyChildren = async () => {
  try {
    const response = await api.get('/parent/children');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch children:', error);
    throw error;
  }
};

/**
 * Fetches attendance records for a specific child.
 * The schoolId is automatically added by the api interceptor.
 * @param {string} childId - The ID of the child.
 */
export const getChildAttendance = async (childId) => {
  try {
    const response = await api.get(`/parent/children/${childId}/attendance`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance for child ${childId}:`, error);
    throw error;
  }
};

/**
 * Fetches academic reports for a specific child.
 * The schoolId is automatically added by the api interceptor.
 * @param {string} childId - The ID of the child.
 */
export const getChildReports = async (childId) => {
  try {
    const response = await api.get(`/parent/children/${childId}/reports`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch academic reports for child ${childId}:`, error);
    throw error;
  }
};
