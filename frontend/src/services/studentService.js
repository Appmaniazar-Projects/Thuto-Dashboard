/**
 * Student Service Module
 * 
 * This service module provides comprehensive functionality for student-related operations
 * in the Thuto Dashboard. It handles profile management, report access, and document
 * retrieval for student users.
 * 
 * Key Features:
 * - Student profile management (view/update)
 * - Academic report access and downloads
 * - School document retrieval
 * - Firebase Storage integration for file handling
 * - Backward compatibility with legacy API endpoints
 * 
 * @module StudentService
 * @author Thuto Dashboard Team
 * @version 2.0.0
 * @since 1.0.0
 */

import api from './api';
import fileUploadService from './fileUploadService';

// ==================== STUDENT PROFILE MANAGEMENT ====================

/**
 * Retrieves the current student's profile information using their phone number
 * 
 * @param {string} phoneNumber - The student's phone number (used as identifier)
 * @returns {Promise<Object>} Promise resolving to student profile data
 * @throws {Error} Throws error if profile not found or API request fails
 * 
 * @example
 * const profile = await getMyProfile('0123456789');
 * console.log(profile.name, profile.email);
 */
export const getMyProfile = async (phoneNumber) => {
  try {
    const response = await api.get(`/student/${phoneNumber}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    throw error;
  }
};

/**
 * Updates the current student's profile information
 * 
 * @param {Object} studentData - Updated student profile data
 * @param {string} studentData.name - Student's full name
 * @param {string} studentData.email - Student's email address
 * @param {string} [studentData.phoneNumber] - Student's phone number
 * @returns {Promise<Object>} Promise resolving to updated profile data
 * @throws {Error} Throws error if update fails or validation errors occur
 * 
 * @example
 * const updatedProfile = await updateProfile({
 *   name: 'John Doe',
 *   email: 'john.doe@example.com'
 * });
 */
export const updateProfile = async (studentData) => {
  try {
    const response = await api.put('/student/updateStudent', studentData);
    return response.data;
  } catch (error) {
    console.error('Failed to update student profile:', error);
    throw error;
  }
};


/**
 * Get student reports from backend (alias for backward compatibility)
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

/**
 * Get student reports from Firebase Storage
 */
export const getReportsFromStorage = async () => {
  try {
    const schoolId = localStorage.getItem('schoolId');
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const criteria = {
      schoolId,
      fileType: 'report',
      targetAudience: 'parents', // Reports are typically for parents but students can view
      studentId: userInfo.id || userInfo.phoneNumber
    };

    return await fileUploadService.getFiles(criteria);
  } catch (error) {
    console.error('Failed to fetch reports from storage:', error);
    throw error;
  }
};

/**
 * Download report from Firebase Storage
 * @param {string} downloadURL - Firebase Storage download URL
 * @param {string} filename - File name for download
 */
export const downloadReportFromStorage = async (downloadURL, filename) => {
  try {
    const response = await fetch(downloadURL);
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report from storage:', error);
    throw error;
  }
};

/**
 * School Documents
 */

/**
 * Get school documents accessible to students
 */
export const getSchoolDocuments = async (filters = {}) => {
  try {
    const schoolId = localStorage.getItem('schoolId');
    
    if (!schoolId) {
      throw new Error('School ID not found');
    }

    const criteria = {
      schoolId,
      fileType: 'document',
      targetAudience: 'students',
      ...filters
    };

    // Get documents for students
    const studentDocs = await fileUploadService.getFiles(criteria);
    
    // Also get documents for all users
    const allUsersCriteria = {
      ...criteria,
      targetAudience: 'all'
    };
    const allUsersDocs = await fileUploadService.getFiles(allUsersCriteria);
    
    // Combine and deduplicate
    const allDocs = [...studentDocs, ...allUsersDocs];
    const uniqueDocs = allDocs.filter((doc, index, self) => 
      index === self.findIndex(d => d.filePath === doc.filePath)
    );
    
    return uniqueDocs;
  } catch (error) {
    console.error('Failed to fetch school documents:', error);
    throw error;
  }
};

// ==================== STUDENT NOTES ====================

/**
 * Retrieves all notes for a specific student
 * 
 * @param {string|number} studentId - The student's ID
 * @returns {Promise<Array>} Promise resolving to array of student notes
 * @throws {Error} Throws error if notes cannot be fetched
 * 
 * @example
 * const notes = await getStudentNotes('123');
 * console.log(notes); // [{ date: '2023-01-01', content: 'Good work', teacherName: 'Mr. Smith', subjectName: 'Math' }]
 */
export const getStudentNotes = async (studentId) => {
  try {
    const response = await api.get(`/student/${studentId}/notes`);
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch student notes:', error);
    throw error;
  }
};

// Export all functions as default object
const studentService = {
  // Profile
  getMyProfile,
  updateProfile,
  
  // Reports
  getMyReports,
  getReportsFromStorage,
  downloadReportFromStorage,
  
  // Documents
  getSchoolDocuments,
  
  // Notes
  getStudentNotes
};

export default studentService;
