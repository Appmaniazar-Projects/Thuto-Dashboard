import api from './api';

/**
 * Fetches the profile of the logged-in student.
 */
export const getMyProfile = async () => {
  try {
    const response = await api.get('/student');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    throw error;
  }
};

/**
 * Fetches the academic reports for the logged-in student.
 */
export const getMyReports = async () => {
  try {
    const response = await api.get('/student/reports');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student reports:', error);
    throw error;
  }
};
