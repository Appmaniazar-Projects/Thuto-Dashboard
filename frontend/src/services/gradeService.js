import api from './api';

/**
 * Grade/Class Management Service
 * Handles all grade-related API operations
 */

/**
 * Create a new grade/class
 * @param {Object} gradeData - Grade information
 * @param {string} gradeData.name - Grade name (e.g., "Grade 8", "Form 1")
 * @returns {Promise<Object>} Created grade object
 */
export const createGrade = async (gradeData) => {
  const response = await api.post('/grades', gradeData);
  return response.data;
};

/**
 * Update an existing grade
 * @param {string} gradeId - Grade ID
 * @param {Object} gradeData - Updated grade information
 * @returns {Promise<Object>} Updated grade object
 */
export const updateGrade = async (gradeId, gradeData) => {
  const response = await api.put(`/grades/${gradeId}`, gradeData);
  return response.data;
};

/**
 * Get all grades in the system
 * @returns {Promise<Array>} Array of grade objects
 */
export const getAllGrades = async () => {
  const response = await api.get('/grades/grades');
  return response.data;
};

/**
 * Get grades for current school
 * @returns {Promise<Array>} Array of grade objects for current school
 */
export const getSchoolGrades = async () => {
  const response = await api.get('/grades');
  return response.data;
};

/**
 * Get students by grade
 * @param {string} gradeId - Grade ID
 * @returns {Promise<Array>} Array of student objects in the grade
 */
export const getStudentsByGrade = async (gradeId) => {
  const response = await api.get(`/grades/${gradeId}/students`);
  return response.data;
};

/**
 * Get grades assigned to a specific teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} Array of grade objects assigned to teacher
 */
export const getGradesByTeacher = async (teacherId) => {
  const response = await api.get(`/grades/teacher/${teacherId}`);
  return response.data;
};

/**
 * Assign a student to a grade
 * @param {string} gradeId - Grade ID
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Assignment result
 */
export const assignStudentToGrade = async (gradeId, studentId) => {
  const response = await api.post(`/grades/${gradeId}/assign-student/${studentId}`);
  return response.data;
};

/**
 * Assign a teacher to a grade
 * @param {string} gradeId - Grade ID
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Object>} Assignment result
 */
export const assignTeacherToGrade = async (gradeId, teacherId) => {
  const response = await api.post(`/grades/assign-teacher/${gradeId}/assign-teacher/${teacherId}`);
  return response.data;
};

/**
 * Delete a grade (if supported by backend)
 * @param {string} gradeId - Grade ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteGrade = async (gradeId) => {
  const response = await api.delete(`/grades/${gradeId}`);
  return response.data;
};

const gradeService = {
  createGrade,
  updateGrade,
  getAllGrades,
  getSchoolGrades,
  getStudentsByGrade,
  getGradesByTeacher,
  assignStudentToGrade,
  assignTeacherToGrade,
  deleteGrade
};

export default gradeService;
