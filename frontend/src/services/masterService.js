import api from './api';

// ========== SUPERADMIN MANAGEMENT (Master-only) ==========

/**
 * Get all superadmins (both national and provincial)
 * @returns {Promise<Array>} List of superadmin users
 */
export const getAllSuperadmins = async () => {
  try {
    const response = await api.get('/master/superadmins');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch superadmins:', error);
    throw error;
  }
};

/**
 * Create a new superadmin
 * @param {Object} superadminData - Superadmin information
 * @param {string} superadminData.name - Full name
 * @param {string} superadminData.email - Email address
 * @param {string} superadminData.role - Must be either 'superadmin_national' or 'superadmin_provincial'
 * @param {string} [superadminData.province] - Required if role is 'superadmin_provincial'
 * @param {string} superadminData.password - Password
 * @returns {Promise<Object>} Created superadmin data
 */
export const createSuperadmin = async (superadminData) => {
  try {
    const { role, province } = superadminData;
    
    // Validate role
    if (!['superadmin_national', 'superadmin_provincial'].includes(role)) {
      throw new Error("Role must be either 'superadmin_national' or 'superadmin_provincial'");
    }
    
    // Validate province for provincial superadmins
    if (role === 'superadmin_provincial' && !province) {
      throw new Error('Province is required for provincial superadmins');
    }
    
    const payload = {
      ...superadminData,
      // Remove province for national superadmins
      province: role === 'superadmin_national' ? null : province
    };
    
    const response = await api.post('/master/superadmins', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create superadmin:', error);
    throw error;
  }
};

/**
 * Update an existing superadmin
 * @param {string} superadminId - ID of the superadmin to update
 * @param {Object} updateData - Updated superadmin information
 * @returns {Promise<Object>} Updated superadmin data
 */
export const updateSuperadmin = async (superadminId, updateData) => {
  try {
    const { role, province } = updateData;
    
    // If role is being updated, validate it
    if (role && !['superadmin_national', 'superadmin_provincial'].includes(role)) {
      throw new Error("Role must be either 'superadmin_national' or 'superadmin_provincial'");
    }
    
    // If changing to provincial, ensure province is provided
    if (role === 'superadmin_provincial' && !province) {
      throw new Error('Province is required for provincial superadmins');
    }
    
    // If changing to national, remove province
    if (role === 'superadmin_national') {
      updateData.province = null;
    }
    
    const response = await api.put(`/master/superadmins/${superadminId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update superadmin ${superadminId}:`, error);
    throw error;
  }
};

/**
 * Delete a superadmin
 * @param {string} superadminId - ID of the superadmin to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteSuperadmin = async (superadminId) => {
  try {
    const response = await api.delete(`/master/superadmins/${superadminId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete superadmin ${superadminId}:`, error);
    throw error;
  }
};

export default {
  getAllSuperadmins,
  createSuperadmin,
  updateSuperadmin,
  deleteSuperadmin
};
