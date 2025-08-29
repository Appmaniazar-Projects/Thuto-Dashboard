import api from './api';

/**
 * Get attendance records for a student
 * @param {string} studentId - The ID of the student
 * @param {Date} startDate - Start date for the attendance records
 * @param {Date} endDate - End date for the attendance records
 * @returns {Promise<Array>} List of attendance records
 */
export const getStudentAttendance = async (studentId, startDate, endDate) => {
  try {
    const response = await api.get('/attendance/student', {
      params: { 
        studentId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

/**
 * Get attendance statistics for a student
 * @param {string} studentId - The ID of the student
 * @returns {Promise<Object>} Attendance statistics
 */
export const getAttendanceStatistics = async (studentId) => {
  try {
    const response = await api.get(`/attendance/student/${studentId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    throw error;
  }
};
