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
 * Create a new grade
 */
export const createGrade = async (gradeData) => {
  try {
    const { schoolId } = getAdminContext();
    if (!schoolId) throw new Error('Missing school ID in admin context');

    // Backend expects only name and schoolId
    const payload = {
      name: gradeData.name,
      schoolId: Number(schoolId)
    };

    const response = await api.post('/grades', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create grade:', error);
    throw error;
  }
};

/**
 * Update an existing grade
 */
export const updateGrade = async (gradeId, gradeData) => {
  try {
    const { schoolId } = getAdminContext();
    
    // Backend expects name and schoolId for updates
    const payload = {
      name: gradeData.name,
      schoolId: Number(schoolId)
    };
    
    const response = await api.put(`/grades/${gradeId}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Failed to update grade ${gradeId}:`, error);
    throw error;
  }
};

/**
 * Fetch all grades in the system (system-wide)
 */
export const getAllGrades = async () => {
  try {
    const response = await api.get('/grades/grades');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all grades:', error);
    throw error;
  }
};

/**
 * Fetch grades for the current school
 */
export const getSchoolGrades = async (schoolId) => {
  try {
    const { token, schoolId: storedSchoolId } = getAdminContext();
    if (!token) throw new Error('No authentication token found');

    const finalSchoolId = schoolId || storedSchoolId;
    if (!finalSchoolId)
      throw new Error('School ID not found in admin context.');

    // Backend expects schoolId as query parameter
    const params = {
      schoolId: Number(finalSchoolId)
    };

    const response = await api.get('/grades', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch school grades:', error);
    throw error;
  }
};

/**
 * Get students by grade
 */
export const getStudentsByGrade = async (gradeId) => {
  try {
    const response = await api.get(`/grades/${gradeId}/students`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch students for grade ${gradeId}:`, error);
    throw error;
  }
};

/**
 * Get grades assigned to a specific teacher
 */
export const getGradesByTeacher = async (teacherId) => {
  try {
    const response = await api.get(`/grades/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch grades for teacher ${teacherId}:`, error);
    throw error;
  }
};

/**
 * Assign a student to a grade
 */
export const assignStudentToGrade = async (gradeId, studentId) => {
  try {
    const response = await api.post(
      `/grades/${gradeId}/assign-student/${studentId}` 
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to assign student ${studentId} to grade ${gradeId}:`,
      error
    );
    throw error;
  }
};

/**
 * Assign a teacher to a grade
 */
export const assignTeacherToGrade = async (gradeId, teacherId) => {
  try {
    const response = await api.post(
      `/grades/assign-teacher/${gradeId}/assign-teacher/${teacherId}` 
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to assign teacher ${teacherId} to grade ${gradeId}:`,
      error
    );
    throw error;
  }
};

/**
 * Delete a grade
 */
export const deleteGrade = async (gradeId) => {
  try {
    const response = await api.delete(`/grades/${gradeId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete grade ${gradeId}:`, error);
    throw error;
  }
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
