import api from './api';

/**
 * Subject Management Service
 * Handles all subject-related API operations
 */

/**
 * Create a new subject
 * @param {Object} subjectData - Subject information
 * @param {string} subjectData.name - Subject name (e.g., "Mathematics", "English")
 * @param {string} subjectData.description - Subject description
 * @param {Array} subjectData.gradeIds - List of grade IDs associated with the subject
 * @returns {Promise<Object>} Created subject object
 */
export const createSubject = async (subjectData) => {
  try {
    // Prepare subject data with grade associations
    const subjectPayload = {
      name: subjectData.name,
      description: subjectData.description,
      gradeIds: subjectData.gradeIds || [], // Array of grade IDs for many-to-many relationship
    };
    
    
    const response = await api.post('/subjects', subjectPayload);
    return response.data;
  } catch (error) {
    console.error('Failed to create subject:', error);
    throw error;
  }
};

/**
 * Update an existing subject
 * @param {string} subjectId - Subject ID
 * @param {Object} subjectData - Updated subject information
 * @returns {Promise<Object>} Updated subject object
 */
export const updateSubject = async (subjectId, subjectData) => {
  const response = await api.put(`/subjects/${subjectId}`, subjectData);
  return response.data;
};

/**
 * Get subjects for current school using query parameters
 * @returns {Promise<Array>} Array of school subjects
 */
export const getSchoolSubjects = async () => {
  try {
    // Backend expects no schoolId filtering - subjects are global now
    const response = await api.get('/subjects');
    
    let subjects = response.data;
    
    // Handle JSON string responses from backend
    if (typeof subjects === 'string') {
      try {
        subjects = JSON.parse(subjects);
      } catch (parseError) {
        console.warn('Could not parse subjects response, returning empty array');
        subjects = [];
      }
    }
    
    // Ensure we have an array
    if (!Array.isArray(subjects)) {
      console.warn('Subjects response is not an array, returning empty array');
      return [];
    }
    
    return subjects;
    
  } catch (error) {
    console.error('Failed to fetch school subjects:', error);
    throw error;
  }
};

/**
 * Get subjects assigned to a specific teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} Array of subject objects assigned to teacher
 */
export const getSubjectsByTeacher = async (teacherId) => {
  try {
    const response = await api.get(`/subjects/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subjects for teacher:', error);
    // Return empty array instead of throwing to prevent dashboard crashes
    return [];
  }
};

/**
 * Delete a subject (if supported by backend)
 * @param {string} subjectId - Subject ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSubject = async (subjectId) => {
  const response = await api.delete(`/subjects/${subjectId}`);
  return response.data;
};

/**
 * Assign a teacher to a subject (if supported by backend)
 * @param {string} subjectId - Subject ID
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} Assignment result
 */
export const assignTeacherToSubject = async (subjectId, teacherId) => {
  const response = await api.post(`/subjects/${subjectId}/assign-teacher/${teacherId}`);
  return response.data;
};

/**
 * Get subjects for a specific student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Array of subject objects for the student
 */
export const getSubjectsByStudent = async (studentId) => {
  try {
    const response = await api.get(`/subjects/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch subjects for student:', error);
    throw error;
  }
};

const subjectService = {
  createSubject,
  updateSubject,
  getSchoolSubjects,
  getSubjectsByStudent,
  getSubjectsByTeacher,
  deleteSubject,
  assignTeacherToSubject
};

export default subjectService;
