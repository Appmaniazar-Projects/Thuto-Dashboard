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
 * @returns {Promise<Object>} Created subject object
 */
export const createSubject = async (subjectData) => {
  const response = await api.post('/subjects', subjectData);
  return response.data;
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
 * Get subjects for current school
 * @returns {Promise<Array>} Array of subject objects for current school
 */
export const getSchoolSubjects = async () => {
  const response = await api.get('/subjects');
  return response.data;
};

/**
 * Get subjects assigned to a specific teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} Array of subject objects assigned to teacher
 */
export const getSubjectsByTeacher = async (teacherId) => {
  const response = await api.get(`/subjects/teacher/${teacherId}`);
  return response.data;
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

const subjectService = {
  createSubject,
  updateSubject,
  getSchoolSubjects,
  getSubjectsByTeacher,
  deleteSubject,
  assignTeacherToSubject
};

export default subjectService;
