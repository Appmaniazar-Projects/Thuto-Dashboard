import api from './api';

// ========== SUPERADMIN MANAGEMENT (Master-only) ==========

/**
 * Get all provincial superadmins
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
 * Create a new provincial superadmin
 * @param {Object} superadminData - Superadmin information
 * @param {string} superadminData.name - Full name
 * @param {string} superadminData.email - Email address
 * @param {string} superadminData.province - Assigned province
 * @param {string} superadminData.password - Password
 * @returns {Promise<Object>} Created superadmin data
 */
export const createSuperadmin = async (superadminData) => {
  try {
    const payload = {
      ...superadminData,
      role: 'superadmin',
      level: 'provincial'
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
