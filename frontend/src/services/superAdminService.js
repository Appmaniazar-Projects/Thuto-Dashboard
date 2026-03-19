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

export const getRegionalAdmins = async (createdBy, regionId) => {
  try {
    const response = await api.get('/superadmins/admins/regional/admins', {
      params: { createdBy, regionId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regional admins:', error);
    throw error;
  }
};

export const getRegionalSchools = async (createdBy, regionId) => {
  try {
    const response = await api.get('/superadmins/admins/schools', {
      params: { createdBy, regionId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch regional schools:', error);
    throw error;
  }
};

export const getAllRoleSpecificUsers = async (role, createdBy, queryString) => {
  try {
    const params = new URLSearchParams(queryString);
    params.append('createdBy', createdBy);

    const response = await api.get(`/superadmins/admins/allRoleSpecificUsers/role/${role}`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch role-specific users for role "${role}":`, error);
    throw error;
  }
};

/**
 * Fetches all schools in the system
 * @param {string} createdBy - Email of the superadmin making the request
 */
export const getAllSchools = async (createdBy, queryString) => {
  try {
    const params = {};
    
    if (createdBy) {
      params.createdBy = createdBy;
    }
    
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // Try the correct endpoint for all schools first
    try {
      const response = await api.get('/superadmins/admins/schools/allSchools', {
        params
      });
      // Map snake_case fields to camelCase for consistency
      const schoolsData = response.data.map(school => ({
        ...school,
        phoneNumber: school.phone_number || school.phoneNumber || null,
        principalName: school.principal_name || school.principalName || null,
        province: school.province || null,
        regionalId: school.regional_id || school.regionalId || null,
        region: school.region || null,
        municipalityId: school.municipality_id || school.municipalityId || null,
        createdBy: school.created_by || school.createdBy || null,
        updatedBy: school.updated_by || school.updatedBy || null
      }));
      return schoolsData;
    } catch (firstError) {
      console.log('Primary endpoint failed, trying alternative...');
      // If primary fails, try without region-specific endpoint
      // This might work for National SuperAdmins who don't have a region
      const response = await api.get('/superadmins/admins/schools', {
        params
      });
      // Also map snake_case fields for the fallback endpoint
      const schoolsData = response.data.map(school => ({
        ...school,
        phoneNumber: school.phone_number || school.phoneNumber || null,
        principalName: school.principal_name || school.principalName || null,
        province: school.province || null,
        regionalId: school.regional_id || school.regionalId || null,
        region: school.region || null,
        municipalityId: school.municipality_id || school.municipalityId || null,
        createdBy: school.created_by || school.createdBy || null,
        updatedBy: school.updated_by || school.updatedBy || null
      }));
      return schoolsData;
    }
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
      regionalId: schoolData.regionalId ? Number(schoolData.regionalId) : null, 
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

/**
 * Bulk upload schools from Excel/CSV file
 * @param {FormData} formData - FormData with file and metadata
 * @returns {Promise<Object>} Upload results
 */
export const bulkUploadSchools = async (formData) => {
  try {
    const response = await api.post('/superadmins/admins/school/bulk/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to bulk upload schools:', error);
    throw error;
  }
};

/**
 * Bulk upload superadmin users from Excel/CSV file
 * @param {FormData} formData - FormData with file and metadata
 * @returns {Promise<Object>} Upload results
 */
export const bulkUploadSuperAdmins = async (formData) => {
  try {
    const response = await api.post('/superadmins/admins/bulk/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to bulk upload superadmins:', error);
    throw error;
  }
};

export default {
  getAllSchools,
  getRegionalSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getAllAdmins,
  getRegionalAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  bulkUploadSuperAdmins,
  bulkUploadSchools
};

