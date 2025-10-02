import api from './api';

// ========== SCHOOL MANAGEMENT ==========

/**
 * Fetches all schools in the system
 * @param {Object} params - Optional query parameters
 * @param {string} params.province - Province filter for Masters
 */
export const getAllSchools = async (params = {}) => {
  try {
    const response = await api.get('/superadmins/admins/schools/allSchools', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    throw error;
  }
};

/**
 * Creates a new school
 * @param {object} schoolData - School information
 */
export const createSchool = async (schoolData) => {
  try {
    const response = await api.post('/superadmins/admins/school/createSchool/create', schoolData);
    return response.data;
  } catch (error) {
    console.error('Failed to create school:', error);
    throw error;
  }
};

/**
 * Updates an existing school
 * @param {string} schoolId - The ID of the school to update
 * @param {object} schoolData - Updated school information
 */
export const updateSchool = async (schoolId, schoolData) => {
  try {
    const response = await api.put(`/superadmins/admins/updateSchool/${schoolId}`, schoolData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update school ${schoolId}:`, error);
    throw error;
  }
};

/**
 * Deletes a school
 * @param {string} schoolId - The ID of the school to delete
 */
export const deleteSchool = async (schoolId) => {
  try {
    const response = await api.delete(`/superadmins/admins/removeSchool/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete school ${schoolId}:`, error);
    throw error;
  }
};

/**
 * Gets detailed school information including user counts
 * @param {string} schoolId - The ID of the school
 */
export const getSchoolDetails = async (schoolId) => {
  try {
    const response = await api.get(`/superadmins/admins/school/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get details for school ${schoolId}:`, error);
    throw error;
  }
};

// ========== ADMINISTRATOR MANAGEMENT ==========

/**
 * Fetches all administrators across all schools
 */
export const getAllAdmins = async () => {
  try {
    const response = await api.get('/superadmins/admins/allRoleSpecificUsers/role/{role}');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch administrators:', error);
    throw error;
  }
};

/**
 * Creates a new administrator
 * @param {object} adminData - Administrator information
 */
export const createAdmin = async (adminData) => {
  try {
    const response = await api.post('/superadmins/admins/create', adminData);
    return response.data;
  } catch (error) {
    console.error('Failed to create administrator:', error);
    throw error;
  }
};

/**
 * Updates an existing administrator
 * @param {string} adminId - The ID of the administrator to update
 * @param {object} adminData - Updated administrator information
 */
export const updateAdmin = async (adminId, adminData) => {
  try {
    const response = await api.put(`/superadmins/admins/${adminId}`, adminData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update administrator ${adminId}:`, error);
    throw error;
  }
};

/**
 * Deletes an administrator
 * @param {string} adminId - The ID of the administrator to delete
 */
export const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/superadmins/admins/${adminId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete administrator ${adminId}:`, error);
    throw error;
  }
};

/**
 * Gets administrators for a specific school
 * @param {string} schoolId - The ID of the school
 */
export const getAdminsBySchool = async (schoolId) => {
  try {
    const response = await api.get(`/superadmins/admins/getadmins/school/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get administrators for school ${schoolId}:`, error);
    throw error;
  }
};

// ========== SYSTEM STATISTICS ==========

/**
 * Fetches system-wide statistics
 */
export const getSystemStats = async () => {
  try {
    const response = await api.get('/superadmin/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system statistics:', error);
    throw error;
  }
};

/**
 * Fetches platform usage analytics
 */
export const getPlatformAnalytics = async () => {
  try {
    const response = await api.get('/superadmin/analytics');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch platform analytics:', error);
    throw error;
  }
};
