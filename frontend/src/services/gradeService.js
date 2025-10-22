import api from './api';

/**
 * ===============================
 * ADMIN GRADE MANAGEMENT SERVICE
 * ===============================
 * Handles grade creation, update, assignment, and retrieval
 * based on backend grade-controller endpoints.
 */

const getAdminContext = () => {
  try {
    const admin = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const schoolId =
      localStorage.getItem('schoolId') ||
      admin.school?.id ||
      admin.schoolId ||
      null;
    return { admin, token, schoolId };
  } catch {
    return { admin: {}, token: null, schoolId: null };
  }
};

/**
 * Create a new grade/class
 * @param {Object} gradeData - Grade information
 * @param {string} gradeData.name - Grade name (e.g., "Grade 8", "Form 1")
 * @returns {Promise<Object>} Created grade object
 */
export const createGrade = async (gradeData) => {
  try {
    // Get admin context for school association
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const schoolId = localStorage.getItem('schoolId') || adminInfo.school?.id;
    const adminEmail = adminInfo.email;
    
    // Validate required context
    if (!schoolId) {
      throw new Error('School ID not found. Cannot create grade without school context.');
    }
    
    // Prepare grade data with school context
    const gradePayload = {
      ...gradeData,
      schoolId: String(schoolId), // Ensure schoolId is string
      createdBy: adminEmail || 'unknown',
      createdByRole: 'admin'
    };

    const response = await api.post('/grades', gradePayload);
    return response.data;
  } catch (error) {
    console.error('Failed to create grade:', error);
    throw error;
  }
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
 * schoolId
 */
export const getSchoolGrades = async (schoolId) => {
  try {
    // Get admin context from JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Get admin info and handle different data structures
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Extract schoolId from various possible locations
    const finalSchoolId = schoolId || 
                         localStorage.getItem('schoolId') || 
                         adminInfo.schoolId || 
                         adminInfo.school?.id || 
                         adminInfo.school?.schoolId;
    
    // Validate we have required context
    if (!finalSchoolId) {
      throw new Error('School ID not found. Admin context may be incomplete.');
    }
    
    const response = await api.get('/grades', {
      params: { schoolId: finalSchoolId } 
    });
    
    let grades = response.data;
    
    // Handle JSON string responses from backend
    if (typeof grades === 'string') {
      try {
        grades = JSON.parse(grades);
      } catch (parseError) {
        // WORKAROUND: Backend is concatenating valid JSON with error object
        // Try to extract the valid JSON part before the error
        try {
          // Look for the pattern: ]}]{"timestamp" which indicates end of array + start of error
          const errorPattern = /\]\}\]\{"timestamp"/;
          const match = grades.match(errorPattern);
          
          if (match) {
            // Extract everything before the error object
            const validJsonEnd = match.index + 3; // Include the closing ]}]
            const validJson = grades.substring(0, validJsonEnd);
            grades = JSON.parse(validJson);
          } else {
            // Try to find any valid JSON array pattern
            const arrayMatch = grades.match(/^\[.*?\](?=\{|$)/s);
            if (arrayMatch) {
              grades = JSON.parse(arrayMatch[0]);
            } else {
              grades = [];
            }
          }
        } catch (extractError) {
          console.warn('Could not parse grades response, returning empty array');
          grades = [];
        }
      }
    }
    
    // Ensure we always return an array
    return Array.isArray(grades) ? grades : [];
  } catch (error) {
    console.error('Failed to fetch school grades:', error);
    throw error;
  }
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
