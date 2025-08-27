import api from './api';

/**
 * Get all subjects for a specific student
 * @param {string} studentId - The ID of the student
 * @returns {Promise<Array>} List of subjects
 */
export const getStudentSubjects = async (studentId) => {
  try {
    const response = await api.get(`/api/students/${studentId}/subjects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    throw error;
  }
};

/**
 * Get subject details by ID
 * @param {string} subjectId - The ID of the subject
 * @returns {Promise<Object>} Subject details
 */
export const getSubjectDetails = async (subjectId) => {
  try {
    const response = await api.get(`/api/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw error;
  }
};
