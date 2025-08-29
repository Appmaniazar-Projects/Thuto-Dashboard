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

/**
 * Get all resources uploaded by the teacher
 */
export const getTeacherResources = async () => {
  try {
    const response = await api.get('/teacher/resources');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teacher resources:', error);
    throw error;
  }
};

/**
 * Upload a new resource
 * @param {Object} resourceData - The resource data including file and metadata
 * @param {File} resourceData.file - The file to upload
 * @param {string} resourceData.classId - The ID of the class this resource is for
 * @param {string} resourceData.description - Optional description of the resource
 */
export const uploadResource = async ({ file, classId, description = '' }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('classId', classId);
  if (description) {
    formData.append('description', description);
  }

  try {
    const response = await api.post('/teacher/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload resource:', error);
    throw error;
  }
};

/**
 * Delete a resource
 * @param {string} resourceId - The ID of the resource to delete
 */
export const deleteResource = async (resourceId) => {
  try {
    await api.delete(`/teacher/resources/${resourceId}`);
  } catch (error) {
    console.error('Failed to delete resource:', error);
    throw error;
  }
};

/**
 * Get classes taught by the teacher
 */
export const getTeacherClasses = async () => {
  try {
    const response = await api.get('/teacher/classes');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teacher classes:', error);
    throw error;
  }
};

/**
 * Get all students in teacher's classes
 */
export const getTeacherStudents = async () => {
  try {
    const response = await api.get('/teacher/students');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teacher students:', error);
    throw error;
  }
};

/**
 * Get recent resources uploaded by the teacher
 */
export const getRecentResources = async (limit = 5) => {
  try {
    const response = await api.get(`/teacher/resources/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recent resources:', error);
    throw error;
  }
};

/**
 * Get class details and students for attendance
 * @param {string} classId - The ID of the class
 */
export const getClassForAttendance = async (classId) => {
  try {
    const response = await api.get(`/teacher/classes/${classId}/attendance`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch class ${classId} for attendance:`, error);
    throw error;
  }
};

/**
 * Get attendance for a specific class and date
 * @param {string} classId - The ID of the class
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const getClassAttendance = async (classId, date) => {
  try {
    const response = await api.get(`/teacher/classes/${classId}/attendance/${date}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance for class ${classId} on ${date}:`, error);
    throw error;
  }
};

/**
 * Submit attendance for a class
 * @param {Object} attendanceData - The attendance data to submit
 * @param {string} attendanceData.classId - The ID of the class
 * @param {string} attendanceData.date - Date in YYYY-MM-DD format
 * @param {string} attendanceData.attendanceType - Type of attendance (full, morning, afternoon)
 * @param {Array} attendanceData.students - Array of student attendance records
 * @param {string} attendanceData.students[].studentId - The ID of the student
 * @param {boolean} attendanceData.students[].isPresent - Whether the student is present
 */
export const submitClassAttendance = async (attendanceData) => {
  try {
    const response = await api.post('/teacher/attendance', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit attendance:', error);
    throw error;
  }
};

/**
 * Get attendance history for a class
 * @param {string} classId - The ID of the class
 * @param {Object} filters - Optional filters for the query
 * @param {string} filters.startDate - Start date in YYYY-MM-DD format
 * @param {string} filters.endDate - End date in YYYY-MM-DD format
 */
export const getAttendanceHistory = async (classId, filters = {}) => {
  try {
    const response = await api.get(`/teacher/classes/${classId}/attendance/history`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance history for class ${classId}:`, error);
    throw error;
  }
};
