/**
 * Attendance Service Module
 * 
 * This service module handles all attendance-related API operations for the Thuto Dashboard.
 * It provides functions for students, teachers, parents, and administrators to manage
 * and retrieve attendance data.
 * 
 * Key Features:
 * - Student attendance retrieval and statistics
 * - Teacher attendance submission and history
 * - Parent child attendance monitoring
 * - Admin attendance management and submissions
 * - Frontend-only filtering (no backend filter parameters)
 * 
 * @module AttendanceService
 * @author Thuto Dashboard Team
 * @version 2.0.0
 * @since 1.0.0
 */

import api from './api';

// ==================== STUDENT ATTENDANCE ====================

/**
 * Retrieves attendance records for a specific student within a date range
 * 
 * This function fetches attendance data from the backend API for a given student
 * and date range. The dates are converted to ISO format (YYYY-MM-DD) for API compatibility.
 * 
 * @param {string} studentId - The unique identifier of the student
 * @param {Date} startDate - Start date for the attendance records (inclusive)
 * @param {Date} endDate - End date for the attendance records (inclusive)
 * @returns {Promise<Array>} Promise resolving to array of attendance records
 * @throws {Error} Throws error if API request fails or student not found
 * 
 * @example
 * const startDate = new Date('2024-01-01');
 * const endDate = new Date('2024-01-31');
 * const attendance = await getStudentAttendance('student123', startDate, endDate);
 */
export const getStudentAttendance = async (studentId, startDate, endDate) => {
  try {
    // Make API request with formatted date parameters
    const response = await api.get(`/attendance/student/${studentId}`, {
      params: { 
        // Convert Date objects to YYYY-MM-DD format for backend compatibility
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });

    const rawData = response.data;
    
    // Debug: Log the actual response structure
    console.log('RAW attendance response:', JSON.stringify(rawData, null, 2));
    console.log('Response type:', typeof rawData);
    console.log('Is array?', Array.isArray(rawData));
    console.log('Has details?', rawData?.details);
    console.log('Has summary?', rawData?.summary);

    let details;
    let summary;

    // Support multiple response structures from backend
    if (Array.isArray(rawData)) {
      // Direct array response
      details = rawData;
      console.log('Using direct array response, found', details.length, 'records');
    } else if (rawData && Array.isArray(rawData.details)) {
      // Object with details property
      details = rawData.details;
      console.log('Using details property, found', details.length, 'records');
      if (rawData.summary) {
        summary = {
          presentDays: rawData.summary.presentDays ?? 0,
          absentDays: rawData.summary.absentDays ?? 0,
          lateDays: rawData.summary.lateDays ?? rawData.summary.late ?? 0,
          attendanceRate: rawData.summary.attendanceRate ?? 0
        };
        console.log('Using provided summary:', summary);
      }
    } else if (rawData && Array.isArray(rawData.data)) {
      // Object with data property
      details = rawData.data;
      console.log('Using data property, found', details.length, 'records');
    } else if (rawData && Array.isArray(rawData.attendance)) {
      // Object with attendance property
      details = rawData.attendance;
      console.log('Using attendance property, found', details.length, 'records');
    } else if (rawData && typeof rawData === 'object') {
      // Try to find any array property in the response
      const arrayProps = Object.keys(rawData).filter(key => Array.isArray(rawData[key]));
      if (arrayProps.length > 0) {
        details = rawData[arrayProps[0]];
        console.log('Using', arrayProps[0], 'property, found', details.length, 'records');
      } else {
        details = [];
        console.log('No array properties found in response object');
      }
    } else {
      details = [];
      console.log('Response is not in expected format, using empty array');
    }

    // If no summary provided by backend, build one from the records
    if (!summary) {
      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;

      console.log('Building summary from', details.length, 'records');
      
      details.forEach((record, index) => {
        const status = (record.status || '').toLowerCase();
        console.log(`Record ${index}:`, { status: record.status, normalized: status });
        if (status === 'present') {
          presentDays++;
        } else if (status === 'absent') {
          absentDays++;
        } else if (status === 'late') {
          lateDays++;
        }
      });

      const total = details.length;
      const attendanceRate = total > 0 ? Math.round((presentDays / total) * 100) : 0;

      summary = {
        presentDays,
        absentDays,
        lateDays,
        attendanceRate
      };
      
      console.log('Calculated summary:', summary);
    }

    console.log('Final attendance data:', { summary, details: details.slice(0, 3) });
    return { summary, details };
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

// ==================== TEACHER ATTENDANCE ====================

/**
 * Get attendance history for a specific grade
 * @param {string} gradeId - Grade ID to fetch attendance for
 * @returns {Promise<Array>} Attendance history data
 */
export const getAttendanceHistory = async (gradeId) => {
  try {
    const response = await api.get(`/attendance/${gradeId}/history`, {
      params: { gradeId }
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
 * @param {string} data.teacherId - Teacher ID
 * @param {string} data.date - Date in YYYY-MM-DD format
 * @param {Array} data.attendance - Array of attendance records
 * @returns {Promise<Object>} Response from the server
 */
export const submitTeacherAttendance = async ({ grade, teacherId, date, attendance }) => {
  try {
    const normalizedAttendance = Array.isArray(attendance) ? attendance : [];

    const toId = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const n = Number(value);
      return Number.isNaN(n) ? null : n;
    };

    const payload = {
      grade: toId(grade),
      teacherId: toId(teacherId),
      date,
      attendance: normalizedAttendance.map((record) => ({
        studentId: toId(record?.studentId),
        status: (record?.status || '').toString().toLowerCase(),
        remarks: (record?.remarks || '').toString()
      }))
    };

    if (!payload.grade) {
      throw new Error('Missing grade ID for attendance submission');
    }

    if (!payload.teacherId) {
      throw new Error('Missing teacher ID for attendance submission');
    }

    const response = await api.post('/attendance/submission', payload);
    return response.data;
  } catch (error) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (typeof error?.response?.data === 'string' ? error.response.data : null);

    console.error('Failed to submit attendance:', error);
    if (apiMessage) {
      error.message = apiMessage;
    }
    throw error;
  }
};

export const getAttendanceByGrade = async (gradeId) => {
  try {
    const response = await api.get(`/grades/teacher/grade/${gradeId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance for grade ${gradeId}:`, error);
    throw error;
  }
};

// ==================== PARENT ATTENDANCE ====================

/**
 * Fetches attendance records for a specific child within a date range.
 *
 * NOTE: Backend requires startDate and endDate query params.
 *
 * @param {string|number} studentId - The ID of the student
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (inclusive)
 * @returns {Promise<{summary?: object, details: Array}>} Normalized attendance data
 */
export const getChildAttendance = async (studentId, startDate, endDate) => {
  try {
    if (!studentId) {
      throw new Error('Missing studentId for attendance fetch');
    }
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new Error('Missing/invalid startDate for attendance fetch');
    }
    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new Error('Missing/invalid endDate for attendance fetch');
    }

    const response = await api.get(`/attendance/student/${studentId}`, {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });

    const rawData = response.data;

    // Backend currently returns List<Attendance>. Normalize to { details }.
    if (Array.isArray(rawData)) {
      return { details: rawData };
    }

    if (rawData && Array.isArray(rawData.details)) {
      return { details: rawData.details, summary: rawData.summary };
    }

    return { details: [] };
  } catch (error) {
    console.error(`Failed to fetch attendance for student ${studentId}:`, error);
    throw error;
  }
};

// ==================== ADMIN ATTENDANCE ====================

/**
 * Get all attendance submissions for admin review
 * @returns {Promise<Array>} List of attendance submissions
 */
export const getAttendanceSubmissions = async () => {
  try {
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;
    const schoolId =
      localStorage.getItem('schoolId') ||
      userData?.school?.id ||
      userData?.schoolId ||
      null;
    const adminEmail = userData?.email || null;

    const params = {
      ...(schoolId ? { schoolId } : {}),
      ...(adminEmail ? { adminEmail } : {})
    };

    const response = await api.get('/attendance/submission', {
      params: Object.keys(params).length > 0 ? params : undefined
    });

    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map((record) => {
      const teacherName =
        record?.teacher?.name ||
        record?.teacherName ||
        record?.teacher?.fullName ||
        'Unknown';
      const gradeLabel =
        record?.grade?.name ||
        record?.grade?.id ||
        record?.grade ||
        record?.gradeId ||
        'N/A';
      const subjectLabel = record?.subject?.name || record?.subject || 'N/A';
      const status = record?.status || record?.approvalStatus || 'UNKNOWN';

      return {
        id: record?.id ?? record?.submissionId,
        date: record?.date,
        teacherName,
        grade: gradeLabel,
        subject: subjectLabel,
        status,
        submittedAt: record?.submittedAt ?? record?.createdAt ?? null,
        raw: record,
      };
    });
  } catch (error) {
    console.error('Error fetching attendance submissions:', error);
    const apiMessage = error?.response?.data?.message || error?.response?.data || error.message;
    if (error.response?.status === 404) {
      return [];
    }
    error.message = `Failed to fetch submissions: ${apiMessage}`;
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
    const response = await api.put(`/attendance/${submissionId}`, updateData);
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
 * Calculates attendance statistics for the current student over the last 3 months
 * 
 * This function retrieves attendance data and performs client-side calculations
 * to generate comprehensive statistics including attendance percentage and counts
 * for different attendance statuses.
 * 
 * @returns {Promise<Object>} Promise resolving to attendance statistics object
 * @returns {Promise<Object>} stats - The attendance statistics
 * @returns {Promise<number>} stats.percentage - Overall attendance percentage (0-100)
 * @returns {Promise<number>} stats.present - Count of present days
 * @returns {Promise<number>} stats.absent - Count of absent days
 * @returns {Promise<number>} stats.late - Count of late arrivals
 * @returns {Promise<number>} stats.total - Total attendance records
 * 
 * @example
 * const stats = await getAttendanceStats();
 * console.log(`Attendance: ${stats.percentage}% (${stats.present}/${stats.total})`);
 */
export const getAttendanceStats = async () => {
  try {
    // Calculate date range for the last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // Go back 3 months from today
    
    // Retrieve current student's ID from localStorage (set during login)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user.id;
    
    // Validate that we have a student ID
    if (!studentId) {
      throw new Error('Student ID not found in user data');
    }
    
    // Fetch normalized attendance data for the calculated date range
    const { summary, details } = await getStudentAttendance(studentId, startDate, endDate);
    
    const total = Array.isArray(details) ? details.length : 0;

    const stats = {
      present: summary?.presentDays ?? 0,
      absent: summary?.absentDays ?? 0,
      late: summary?.lateDays ?? 0,
      total
    };
    
    // Prefer the precomputed rate, but fall back to local calculation if needed
    const percentage =
      typeof summary?.attendanceRate === 'number'
        ? summary.attendanceRate
        : (stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0);
    
    return {
      percentage,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      total: stats.total
    };
    
  } catch (error) {
    console.error('Failed to calculate attendance stats:', error);
    
    // Return safe default values to prevent UI crashes
    return { 
      percentage: 0, 
      present: 0, 
      absent: 0, 
      late: 0, 
      total: 0 
    };
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
