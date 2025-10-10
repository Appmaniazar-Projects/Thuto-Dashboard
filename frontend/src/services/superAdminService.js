import api from './api';

// ========== SCHOOL MANAGEMENT ==========
/**
 * Fetches all administrators across all schools
 * @param {string} createdBy - Email of the superadmin making the request
 */
export const getAllAdmins = async (role = 'admin', createdBy) => {
  try {
    const response = await api.get(`/superadmins/admins/allRoleSpecificUsers/role/${role}`, {
      params: { createdBy }
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
export const getAllSchools = async (createdBy) => {
  try {
    const response = await api.get('/superadmins/admins/schools/allSchools', {
      params: { createdBy }
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
      `/superadmins/updateSchool/${schoolId}`, 
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

// /**
//  * Creates a new administrator
//  * @param {object} adminData - Administrator information
//  */
// export const createAdmin = async (adminData) => {
//   try {
//     const { createdBy, ...adminPayload } = adminData;
//     const response = await api.post('/superadmins/admins/create', adminPayload, {
//       params: { createdBy }  // Send createdBy as query parameter
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Failed to create administrator:', error);
//     throw error;
//   }
// };

// /**
//  * Updates an existing administrator
//  * @param {string} adminId - The ID of the administrator to update
//  * @param {object} adminData - Updated administrator information
//  */
// export const updateAdmin = async (adminId, adminData) => {
//   try {
//     const { createdBy, ...adminPayload } = adminData;
//     const response = await api.put(`/superadmins/admins/update/${adminId}`, adminPayload, {
//       params: createdBy ? { createdBy } : {}
//     });
//     return response.data;
//   } catch (error) {
//     console.error(`Failed to update admin ${adminId}:`, error);
//     throw error;
//   }
// };

/**
 * Creates a new administrator
 * @param {object} adminData - Administrator information
 */
// export const createAdmin = async (adminData) => {
//   try {
//     console.log('Creating admin with data:', {
//       ...adminData,
//       password: '***HIDDEN***'
//     });

//     const { createdBy, ...adminPayload } = adminData;
    
//     const response = await api.post('/superadmins/admins/create', adminPayload, {
//       params: { createdBy }
//     });
  
//     console.log('Admin created successfully:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Failed to create administrator:', error);
//     console.error('Error response:', error.response?.data);
//     console.error('Error status:', error.response?.status);
//     throw error;
//   }
// };

export const createAdmin = async (adminData) => {
  try {
    console.log('=== ADMIN CREATION DEBUG ===');
    console.log('Full adminData received:', adminData);
    console.log('adminData type:', typeof adminData);

    const { createdBy, ...adminPayload } = adminData;
    
    console.log('Extracted createdBy:', createdBy);
    console.log('createdBy type:', typeof createdBy);
    console.log('Admin payload (without createdBy):', adminPayload);
    console.log('Payload keys:', Object.keys(adminPayload));
    
    if (!createdBy) {
      throw new Error('createdBy parameter is required but was not provided');
    }

    console.log('Making API call to: /superadmins/admins/create');
    console.log('Query params:', { createdBy });
    console.log('Request body:', adminPayload);
    
    const response = await api.post('/superadmins/admins/create', adminPayload, {
      params: { createdBy }
    });
  
    console.log('Admin created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== ADMIN CREATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    console.error('Full error object:', error);
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
    console.log('Updating admin with data:', {
      ...adminData,
      password: adminData.password ? '***HIDDEN***' : 'NOT_CHANGED'
    });

    // Keep updatedBy in the payload, only extract createdBy
    const { createdBy, ...adminPayload } = adminData;
    
    // Make sure we're not sending an empty password
    if (adminPayload.password === '') {
      delete adminPayload.password;
    }

    console.log('Sending update request with:', {
      url: `/superadmins/admins/user/updateUser/${adminId}`,
      data: adminPayload  // updatedBy is now part of adminPayload
    });

    const response = await api.put(
      `/superadmins/admins/user/updateUser/${adminId}`, 
      adminPayload  // Send updatedBy in the request body
    );
    
    console.log('Admin updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update admin ${adminId}:`, error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

/**
 * Deletes an administrator
 * @param {string} adminId - The ID of the administrator to delete
 */
export const deleteAdmin = async (adminId, createdBy) => {
  try {
    console.log('Deleting admin with ID:', adminId, 'createdBy:', createdBy);
    const response = await api.delete(`/superadmins/admins/remove/${adminId}`, {
      params: createdBy ? { createdBy } : {}
    });
    console.log('Admin deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete admin ${adminId}:`, error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
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