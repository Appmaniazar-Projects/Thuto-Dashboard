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
 * Fetches all users for the admin.
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get('admin/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

/**
 * Fetches users by role
 * @param {string} role - The role to filter by (admin, teacher, student, parent)
 */
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`admin/users?role=${role}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch users with role ${role}:`, error);
    throw error;
  }
};

/**
 * Creates a new user
 * @param {object} userData - User information including name, email, role, etc.
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('admin/users', userData);
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
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error;
  }
};

/**
 * Deletes a user
 * @param {string} userId - The ID of the user to delete
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
};

/**
 * Creates a new administrator
 * @param {object} adminData - Administrator information
 */
export const createAdmin = async (adminData) => {
  try {
    const response = await api.post('admin/admins', adminData);
    return response.data;
  } catch (error) {
    console.error('Failed to create administrator:', error);
    throw error;
  }
};

/**
 * Creates a new teacher
 * @param {object} teacherData - Teacher information including subjects and grade
 */
export const createTeacher = async (teacherData) => {
  try {
    const response = await api.post('admin/teachers', teacherData);
    return response.data;
  } catch (error) {
    console.error('Failed to create teacher:', error);
    throw error;
  }
};

/**
 * Gets user statistics for the admin dashboard
 */
export const getUserStats = async () => {
  try {
    const response = await api.get('admin/users/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user statistics:', error);
    throw error;
  }
};

/**
 * Bulk creates users from CSV data
 * @param {FormData} csvFile - CSV file with user data
 */
export const bulkCreateUsers = async (csvFile) => {
  try {
    const response = await api.post('admin/users/bulk', csvFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to bulk create users:', error);
    throw error;
  }
};

/**
 * Resets a user's password
 * @param {string} userId - The ID of the user
 * @param {string} newPassword - The new password
 */
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await api.put(`admin/users/${userId}/reset-password`, { password: newPassword });
    return response.data;
  } catch (error) {
    console.error(`Failed to reset password for user ${userId}:`, error);
    throw error;
  }
};
