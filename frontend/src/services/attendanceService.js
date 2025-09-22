import api from './api';

// ==================== STUDENT ATTENDANCE ====================

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

/**
 * Get my attendance (for current student)
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Student's attendance records
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

/**
 * Get attendance stats for current student
 * @returns {Promise<Object>} Attendance statistics
 */
export const getAttendanceStats = async () => {
  try {
    const response = await api.get('/student/attendance/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance stats:', error);
    throw error;
  }
};

// ==================== TEACHER ATTENDANCE ====================

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
 * @param {string} attendanceData.attendanceType - Type of attendance (full_day, morning, afternoon)
 * @param {Array} attendanceData.students - Array of student attendance records
 * @param {string} attendanceData.students[].studentId - The ID of the student
 * @param {boolean} attendanceData.students[].isPresent - Whether the student is present
 * @returns {Promise<Object>} Response data from the server
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

/**
 * Submit attendance (alternative endpoint)
 * @param {Object} data - Attendance submission data
 * @param {string} data.grade - Grade level
 * @param {string} data.subject - Subject name
 * @param {string} data.date - Date in YYYY-MM-DD format
 * @param {Array} data.attendance - Array of attendance records
 */
export const submitTeacherAttendance = async ({ grade, subject, date, attendance }) => {
  try {
    const response = await api.post("/teacher/attendance", { grade, subject, date, attendance });
    return response.data;
  } catch (error) {
    console.error('Failed to submit teacher attendance:', error);
    throw error;
  }
};

// ==================== PARENT ATTENDANCE ====================

/**
 * Fetches attendance records for a specific child
 * @param {string} childId - The ID of the child
 * @param {Object} [params] - Query parameters (e.g., { month: 1, year: 2023 })
 * @returns {Promise<Object>} Attendance data
 */
export const getChildAttendance = async (childId, params = {}) => {
  try {
    const response = await api.get(`/parent/children/${childId}/attendance`, { 
      params 
    });
    return response.data || {};
  } catch (error) {
    console.error(`Failed to fetch attendance for child ${childId}:`, error);
    throw new Error('Failed to load attendance records.');
  }
};

// ==================== ADMIN ATTENDANCE ====================

/**
 * Fetches all attendance submissions for the admin.
 */
export const getAttendanceSubmissions = async () => {
  try {
    const response = await api.get('attendance/submissions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance submissions:', error);
    throw error;
  }
};

/**
 * Updates the status of a specific attendance submission.
 * @param {string} submissionId - The ID of the attendance submission to update.
 * @param {object} updateData - An object containing the new status.
 */
export const updateAttendanceSubmission = async (submissionId, updateData) => {
  try {
    const response = await api.patch(`attendance/submissions/${submissionId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Failed to update attendance submission:', error);
    throw error;
  }
};

/**
 * Fetches all attendance data for frontend filtering
 * @param {Object} filters - Optional filters to apply on the frontend
 */
export const fetchAllAttendance = async (filters = {}) => {
  try {
    const response = await api.get("/admin/attendance");
    // Apply date range filter on the frontend
    let filteredData = [...(response.data || [])];
    
    if (filters.startDate) {
      filteredData = filteredData.filter(record => 
        new Date(record.date) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      filteredData = filteredData.filter(record => 
        new Date(record.date) <= new Date(filters.endDate)
      );
    }
    
    return filteredData;
  } catch (error) {
    console.error('Failed to fetch all attendance:', error);
    throw error;
  }
};

// ==================== EXPORTS ====================

const attendanceService = {
  // Student functions
  getStudentAttendance,
  getAttendanceStatistics,
  getMyAttendance,
  getAttendanceStats,
  
  // Teacher functions
  getClassForAttendance,
  getClassAttendance,
  submitAttendance,
  getAttendanceHistory,
  submitTeacherAttendance,
  
  // Parent functions
  getChildAttendance,
  
  // Admin functions
  getAttendanceSubmissions,
  updateAttendanceSubmission,
  fetchAllAttendance
};

export default attendanceService;
