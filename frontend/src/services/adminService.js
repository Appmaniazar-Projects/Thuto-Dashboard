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
