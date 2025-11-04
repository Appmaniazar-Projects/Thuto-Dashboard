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
    return response.data;
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
    const response = await api.get(`/attendance/grades/${gradeId}/history`);
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
 * @returns {Promise<Object>} Attendance data
 */
export const getChildAttendance = async (studentId) => {
  try {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data || {};
  } catch (error) {
    console.error(`Failed to fetch attendance for student ${studentId}:`, error);
    throw new Error('Failed to load attendance records.');
  }
};

// ==================== ADMIN ATTENDANCE ====================

/**
 * Get all attendance submissions for admin review
 * @returns {Promise<Array>} List of attendance submissions
 */
export const getAttendanceSubmissions = async () => {
  try {
    const response = await api.get('/attendance/submissions');
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
    
    // Fetch attendance records for the calculated date range
    const attendanceRecords = await getStudentAttendance(studentId, startDate, endDate);
    
    // Initialize statistics counters
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      total: 0
    };
    
    // Process attendance records and count different statuses
    if (Array.isArray(attendanceRecords)) {
      attendanceRecords.forEach(record => {
        stats.total++;
        
        // Categorize each record by status
        switch (record.status?.toLowerCase()) {
          case 'present':
            stats.present++;
            break;
          case 'absent':
            stats.absent++;
            break;
          case 'late':
            stats.late++;
            break;
          default:
            // Handle unknown status types gracefully
            console.warn(`Unknown attendance status: ${record.status}`);
        }
      });
    }
    
    // Calculate attendance percentage (present days / total days * 100)
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
