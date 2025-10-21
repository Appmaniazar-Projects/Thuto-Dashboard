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
  try {
    // Get admin context for schoolId
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId') || adminInfo.schoolId;
    
    if (!schoolId) {
      throw new Error('School ID not found in admin context');
    }
    
    // Include schoolId in the payload
    const payload = {
      ...subjectData,
      schoolId: Number(schoolId)
    };
    
    const response = await api.post('/subjects', payload);
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
 * Get all subjects for the current school
 * Now expects backend to return subjects with embedded schoolId
 * @returns {Promise<Array>} Array of school subjects
 */
export const getSchoolSubjects = async () => {
  try {
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId') || adminInfo.schoolId;
    
    if (!schoolId) {
      throw new Error('School ID not found in admin context');
    }
    
    // Backend now returns all subjects with embedded schoolId
    // We filter on frontend for the specific school
    const response = await api.get('/subjects');
    
    let subjects = response.data;
    
    // Handle JSON string responses from backend
    if (typeof subjects === 'string') {
      try {
        subjects = JSON.parse(subjects);
        console.log('✅ Parsed subjects JSON string response');
      } catch (parseError) {
        console.error('❌ Failed to parse subjects JSON string:', parseError);
        subjects = [];
      }
    }
    
    // Ensure we have an array
    if (!Array.isArray(subjects)) {
      console.warn('⚠️ Subjects response is not an array, returning empty array');
      return [];
    }
    
    // Filter subjects by schoolId (now embedded in subject data)
    const schoolSubjects = subjects.filter(subject => {
      // Handle both string and number schoolId comparisons
      return subject.schoolId && 
             (String(subject.schoolId) === String(schoolId));
    });
    
    console.log(`📚 Found ${schoolSubjects.length} subjects for school ${schoolId}`);
    return schoolSubjects;
    
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
