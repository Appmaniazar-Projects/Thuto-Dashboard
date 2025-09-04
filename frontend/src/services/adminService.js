import api from './api';

/**
 * Fetches all attendance submissions for the admin.
 */
export const getAttendanceSubmissions = async () => {
  try {
    const response = await api.get('attendance/submissions');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch attendance submissions:', error);
    throw error;
  }
};

/**
 * Updates the status of a specific attendance submission.
 * @param {string} submissionId - The ID of the attendance submission to update.
 * @param {object} updateData - An object containing the new status.
 */
export const updateAttendanceSubmission = async (submissionId, updateData) => {
  try {
    const response = await api.put(`attendance/submissions/${submissionId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update attendance submission ${submissionId}:`, error);
    throw error;
  }
};

// ========== USER MANAGEMENT ==========

/**
 * Get all users with role-specific details
 * @returns {Promise<Array>} Array of user objects with their role-specific data
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/allRoleSpecificUsers/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Get users filtered by a specific role
 * @param {string} role - Role to filter by (Teacher, Student, or Parent)
 * @returns {Promise<Array>} Array of user objects for the specified role
 */
export const getUsersByRole = async (role) => {
  try {
    if (!['Teacher', 'Student', 'Parent'].includes(role)) {
      throw new Error('Invalid role. Must be one of: Teacher, Student, Parent');
    }
    const response = await api.get(`/admin/allRoleSpecificUsers/${role}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error);
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
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
};

/**
 * Updates an existing user
 * @param {string} userId - The ID of the user to update
 * @param {object} userData - Updated user information
 * @returns {Promise<object>} Updated user object
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error;
  }
};

/**
 * Deletes a user
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise<object>} Deletion status
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
};

export default {
  getAttendanceSubmissions,
  updateAttendanceSubmission,
  getAllUsers,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser
};
