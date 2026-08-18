import api from './api';

/**
 * Create a new bug report.
 * POST /api/bugs
 * Body: { description, expectedBehavior, actualBehavior, role, schoolId, page }
 */
export const createBug = async (payload) => {
  const { data } = await api.post('/bugs', payload);
  return data;
};

/**
 * Update a bug (status change, assignment, etc.) — super admin side.
 * PUT /api/bugs/{id}
 * e.g. updateBug(bugId, { status: 'in_progress', assignedTo: 'tiffany@...' })
 */
export const updateBug = async (bugId, updates) => {
  const { data } = await api.put(`/bugs/${bugId}`, updates);
  return data;
};

/**
 * List active bugs (excludes done/duplicate server-side) for the
 * super admin dashboard.
 * GET /api/bugs/active — takes no params, so status/school filtering
 * has to happen client-side against whatever this returns.
 */
export const getAllBugs = async () => {
  const { data } = await api.get('/bugs/active');
  return data;
};

export default {
  createBug,
  updateBug,
  getAllBugs
};