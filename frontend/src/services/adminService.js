import api from './api';

/**
 * Fetches all users for the admin
 * @returns {Promise<Array>} Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/allRoleSpecificUsers/all');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

/**
 * Fetches users by role
 * @param {string} role - User role to filter by
 * @returns {Promise<Array>} Array of user objects with specified role
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/admin/allRoleSpecificUsers/${role}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch users with role ${role}:`, error);
    throw error;
  }
};

/**
 * Creates a new user with the specified role
 * @param {object} userData - User information including role
 * @returns {Promise<object>} Created user object
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/createUser', userData);
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
};

/**
 * Updates an existing user
 * @param {string} userId - User ID to update
 * @param {object} userData - Updated user information
 * @returns {Promise<object>} Updated user object
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

/**
 * Deletes a user
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    await api.delete(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};

export default {
  getAllUsers,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser
};
