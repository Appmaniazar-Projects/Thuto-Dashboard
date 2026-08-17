import axios from 'axios';

// NOTE: Adjust API_BASE_URL / endpoint paths to match whatever base URL your
// other services (e.g. superAdminService) use — this follows the same
// axios + error-shape convention as the rest of the app.
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const bugsApi = axios.create({
  baseURL: `${API_BASE_URL}/bugs`
});

// Attach auth token the same way other services do, if applicable.
// bugsApi.interceptors.request.use((config) => { ... return config; });

/**
 * Create a new bug report.
 * Payload shape agreed in the 17 Aug meeting:
 * { description, expectedBehavior, actualBehavior, role, schoolId, page }
 */
export const createBug = async (payload) => {
  const { data } = await bugsApi.post('/', payload);
  return data;
};

/**
 * Update a bug (status change, assignment, etc.) — super admin side.
 * e.g. updateBug(bugId, { status: 'in_progress', assignedTo: 'tiffany@...' })
 */
export const updateBug = async (bugId, updates) => {
  const { data } = await bugsApi.patch(`/${bugId}`, updates);
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
  const { data } = await bugsApi.get('/', { params: filters });
  return data;
};

export default {
  createBug,
  updateBug,
  getAllBugs
};