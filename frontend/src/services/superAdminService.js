import api from './api';

// ========== SCHOOL MANAGEMENT ==========
/**
 * Fetches all administrators across all schools
 * @param {string} createdBy - Email of the superadmin making the request
 */
export const getAllAdmins = async (role = 'admin', createdBy, queryString) => {
  try {
    const params = new URLSearchParams(queryString);
    params.append('createdBy', createdBy);
    
    const response = await api.get(`/superadmins/admins/allRoleSpecificUsers/role/${role}`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch administrators:', error);
    throw error;
  }
};

/**
 * Fetches all schools in the system
 * @param {string} createdBy - Email of the superadmin making the request
 */
export const getAllSchools = async (createdBy, queryString) => {
  try {
    const params = new URLSearchParams(queryString);
    params.append('createdBy', createdBy);

    const response = await api.get('/superadmins/admins/schools/allSchools', {
      params
    });
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
    const response = await api.post('/superadmins/admins/school/createSchool/create', {
      ...schoolData,
     
    });
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
export const updateSchool = async (schoolId, schoolData, updatedBy) => {
  try {
    const response = await api.put(
      `/superadmins/admins/updateSchool/${schoolId}`, 
      schoolData,
      {
        params: { updatedBy }
      }
    );
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
 * Creates a new administrator
 * @param {object} adminData - Administrator information
 *  - includes: name, lastName, email, phoneNumber, schoolId, password, province
 *  - also includes: createdBy (superadmin email)
 */
export const createAdmin = async (adminData) => {
  try {
    const { createdBy, ...adminPayload } = adminData;

    if (!createdBy) {
      throw new Error('createdBy parameter is required');
    }

    const response = await api.post('/superadmins/admins/create', adminPayload, {
      params: { createdBy }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to create administrator:', error);
    throw error;
  }
};

/**
 * Updates an existing administrator
 * @param {string|number} adminId - The ID (or identifier) of the administrator to update
 * @param {object} adminData - Updated administrator information
 *  - includes: name, lastName, email, phoneNumber, schoolId, province
 *  - may include: password (optional), updatedBy (superadmin email)
 */
export const updateAdmin = async (adminId, adminData) => {
  try {
    const { createdBy, ...adminPayload } = adminData; // discard createdBy, keep updatedBy & province

    // Do not send an empty password
    if (adminPayload.password === '') {
      delete adminPayload.password;
    }

    const response = await api.put(
      `/superadmins/admins/user/updateUser/${adminId}`,
      adminPayload
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to update admin ${adminId}:`, error);
    throw error;
  }
};

/**
 * Deletes an administrator
 * @param {string|number} adminId - The ID of the administrator to delete
 */
export const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/superadmins/admins/removeAdmin/${adminId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete admin ${adminId}:`, error);
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

