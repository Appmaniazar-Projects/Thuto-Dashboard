import api from './api';

/**
 * Create a new bug report.
 * { description, expectedBehavior, actualBehavior, role, schoolId, page }
 */
export const createBug = async (payload) => {
  const { data } = await api.post('/bugs', payload);
  return data;
};

/**
 * Update a bug (status change, assignment, etc.) - super admin side.
 * e.g. updateBug(bugId, { status: 'in_progress', assignedTo: 'tiffany@...' })
 */
export const updateBug = async (bugId, updates) => {
  const { data } = await api.patch(`/bugs/${bugId}`, updates);
  return data;
};

/**
 * List bugs for the super admin dashboard.
 * Server should exclude status === 'done' and status === 'duplicate'
 * per the meeting (list endpoint only returns "active" bugs).
 * Optional client-side filters (status, schoolId) can also be passed
 * as query params if the backend supports it.
 */
export const getAllBugs = async (filters = {}) => {
  const { data } = await api.get('/bugs', { params: filters });
  return data;
};

export default {
  createBug,
  updateBug,
  getAllBugs
};