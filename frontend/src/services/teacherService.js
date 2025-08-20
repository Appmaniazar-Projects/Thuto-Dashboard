import api from './api';

/**
 * Fetches the students assigned to the logged-in teacher.
 */
export const getMyStudents = async () => {
  try {
    const response = await api.get('/teacher/students');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
};

/**
 * Fetches academic reports for a specific student.
 * @param {string} studentId - The ID of the student.
 */
export const getStudentReports = async (studentId) => {
  try {
    const response = await api.get(`/teacher/students/${studentId}/reports`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch reports for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Uploads a report for a specific student.
 * @param {string} studentId - The ID of the student.
 * @param {File} file - The report file to upload.
 * @param {string} description - A description for the report.
 */
export const uploadStudentReport = async (studentId, file, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);

  try {
    const response = await api.post(`/teacher/students/${studentId}/reports`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to upload report for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Submits attendance data for the class.
 * @param {Object} attendanceData - The attendance data to submit.
 */
export const submitAttendance = async (attendanceData) => {
  try {
    const response = await api.post('/teacher/attendance', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit attendance:', error);
    throw error;
  }
};
