import api from './api';

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

export const getAttendanceStats = async (studentId) => {
  try {
    const response = await api.get(`/attendance/student/${studentId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    throw error;
  }
};
