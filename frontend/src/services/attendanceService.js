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
    const response = await api.get(`/attendance/student/${studentId}`, {
      params: { 
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

// ==================== TEACHER ATTENDANCE ====================

/**
 * Get attendance history for a class
 * @param {string} gradeId - The ID of the grade
 * @param {Object} filters - Optional filters for the query
 * @param {string} filters.startDate - Start date in YYYY-MM-DD format
 * @param {string} filters.endDate - End date in YYYY-MM-DD format
 */
export const getAttendanceHistory = async (gradeId, filters = {}) => {
  try {
    const response = await api.get(`/attendance/grades/${gradeId}/history`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance history for grade ${gradeId}:`, error);
    throw error;
  }
};

/**
 * Submit attendance for students
 * @param {Object} data - Attendance submission data
 * @param {string} data.grade - Grade level
 * @param {string} data.subject - Subject name
 * @param {string} data.date - Date in YYYY-MM-DD format
 * @param {Array} data.attendance - Array of attendance records
 * @returns {Promise<Object>} Response from the server
 */
export const submitTeacherAttendance = async ({ grade, subject, date, attendance }) => {
  try {
    const response = await api.post("/attendance/submission", { 
      grade, 
      subject, 
      date, 
      attendance 
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit attendance:', error);
    throw error;
  }
};

// ==================== PARENT ATTENDANCE ====================

/**
 * Fetches attendance records for a specific child
 * @param {string} studentId - The ID of the student
 * @param {Object} [params] - Query parameters (e.g., { month: 1, year: 2023 })
 * @returns {Promise<Object>} Attendance data
 */
export const getChildAttendance = async (studentId, params = {}) => {
  try {
    const response = await api.get(`/attendance/student/${studentId}`, { 
      params 
    });
    return response.data || {};
  } catch (error) {
    console.error(`Failed to fetch attendance for student ${studentId}:`, error);
    throw new Error('Failed to load attendance records.');
  }
};

// ==================== ADMIN ATTENDANCE ====================

/**
 * Get all attendance submissions for admin review
 * @param {Object} filters - Optional filters (e.g., status, date range)
 * @returns {Promise<Array>} List of attendance submissions
 */
export const getAttendanceSubmissions = async (filters = {}) => {
  try {
    const response = await api.get('/attendance/submissions', {
      params: filters
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching attendance submissions:', error);
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
    const response = await api.get("/attendance");
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

/**
 * Get attendance statistics for the current student (calculated from attendance data)
 * @returns {Promise<Object>} Attendance statistics (percentage, present, absent, late counts)
 */
export const getAttendanceStats = async () => {
  try {
    // Get current date and calculate date range (e.g., current month or semester)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
    
    // Get the current student's ID from token (this should be handled by the backend)
    // For now, we'll make a call to get current student info
    const studentResponse = await api.get('/student/profile');
    const studentId = studentResponse.data.id;
    
    // Get attendance records using existing function
    const attendanceRecords = await getStudentAttendance(studentId, startDate, endDate);
    
    // Calculate stats on frontend
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      total: 0
    };
    
    if (Array.isArray(attendanceRecords)) {
      attendanceRecords.forEach(record => {
        stats.total++;
        if (record.status === 'present') {
          stats.present++;
        } else if (record.status === 'absent') {
          stats.absent++;
        } else if (record.status === 'late') {
          stats.late++;
        }
      });
    }
    
    // Calculate percentage
    const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    
    return {
      percentage,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      total: stats.total
    };
    
  } catch (error) {
    console.error('Failed to calculate attendance stats:', error);
    // Return default stats to prevent UI breakage
    return { percentage: 0, present: 0, absent: 0, late: 0, total: 0 };
  }
};

// ==================== EXPORTS ====================

const attendanceService = {
  // Student functions
  getStudentAttendance,
  getAttendanceStats,
  
  // Teacher functions
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
