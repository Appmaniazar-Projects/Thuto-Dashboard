import api from './api';

// ========== SUPERADMIN MANAGEMENT (Master-only) ==========

/**
 * Fetches all provincial superadmins for Master role
 * @returns {Promise<Array>} List of provincial superadmins
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
 * Creates a new provincial superadmin
 * @param {Object} superadminData - Superadmin information
 * @param {string} superadminData.name - Full name
 * @param {string} superadminData.email - Email address
 * @param {string} superadminData.province - Assigned province
 * @param {string} superadminData.password - Password
 * @returns {Promise<Object>} Created superadmin object
 */
export const createSuperadmin = async (superadminData) => {
  try {
    // Ensure the correct role and level are set
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
 * Updates an existing provincial superadmin
 * @param {string} superadminId - ID of the superadmin to update
 * @param {Object} updateData - Updated superadmin information
 * @returns {Promise<Object>} Updated superadmin object
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
 * Deletes a provincial superadmin
 * @param {string} superadminId - ID of the superadmin to delete
 * @returns {Promise<Object>} Deletion result
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
