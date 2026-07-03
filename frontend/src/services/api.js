import axios from "axios";

// Create axios instance - configured to use Railway backend
const api = axios.create({
  // Use Railway backend URL
  baseURL: `${process.env.REACT_APP_API_URL || 'https://soothing-magic-production-efff.up.railway.app'}/api`,
  timeout: 170000, 
  headers: {
    "Content-Type": "application/json",
  },
});


// Request interceptor - for future backend integration
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add schoolId parameter for school-scoped requests
    const user = localStorage.getItem("user");
    const superAdmin = localStorage.getItem("superAdmin");
    
    let userData = null;
    try {
      if (user) {
        userData = JSON.parse(user);
      } else if (superAdmin) {
        userData = JSON.parse(superAdmin);
      }
    } catch (e) {
      console.warn('Error parsing user data for schoolId:', e);
    }

    const normalizedSchoolId =
      localStorage.getItem('schoolId') ||
      userData?.schoolId ||
      userData?.school?.id ||
      userData?.school?.schoolId ||
      null;

    // Add schoolId to requests that need it (exclude specific services and endpoints)
    const excludedPaths = [
      '/auth/',
      '/superadmin/',
      '/superadmins/',
      '/master/',
      '/attendance/',
      '/resources/',
      '/grades/',
      '/teacher/',
      '/admin/',
      '/parent',
      '/api/parent/',
      '/users/',
      '/subjects/',
      '/student/',
      '/events/'

    ];

    const requestUrl = (config.url || '').toString();

    // Use startsWith for /parent to avoid partial matches on other paths,
    // and includes for all other excluded paths
    const shouldExcludeSchoolId =
      requestUrl.startsWith('/parent') ||
      excludedPaths
        .filter(p => p !== '/parent')
        .some(path => requestUrl.includes(path));

    if (normalizedSchoolId && !shouldExcludeSchoolId) {
      // Add schoolId as query parameter
      if (!config.params) {
        config.params = {};
      }
      
      // Only add if not already present
      if (!config.params.schoolId) {
        config.params.schoolId = normalizedSchoolId;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      console.error("Backend server is not running or not accessible");
      error.message =
        "Unable to connect to server.";
    } else if (error.response?.status === 401) {
      const requestUrl = (error.config?.url || '').toString();
      const isAuthRequest =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/admin/login') ||
        requestUrl.includes('/superadmins/auth/login') ||
        requestUrl.includes('/auth/refresh-token');

      if (!isAuthRequest) {
        // Handle unauthorized access
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("schoolId");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ========== ADMIN DASHBOARD ENDPOINTS ==========

/**
 * Fetches all student data for frontend filtering
 * @param {Object} filters - Optional filters to apply on the frontend
 */
// export const fetchAllStudents = (filters = {}) => 
//   api.get("/admin/students").then(response => {
//     // Apply filters on the frontend
//     let filteredData = [...(response.data || [])];
    
//     if (filters.grade) {
//       filteredData = filteredData.filter(student => student.grade === filters.grade);
//     }
    
//     if (filters.gender) {
//       filteredData = filteredData.filter(student => student.gender === filters.gender);
//     }
    
//     if (filters.status) {
//       filteredData = filteredData.filter(student => student.status === filters.status);
//     }
    
//     return { data: filteredData };
//   });

/**
 * Fetches all staff data
 * @returns {Promise<Object>} Staff data
 */
export const fetchAllStaff = () => 
  api.get("/admin/staff").then(response => ({
    data: response.data || []
  }));

export const fetchEvents = () => {
  const storedUser = localStorage.getItem('user');
  let schoolId = localStorage.getItem('schoolId');

  try {
    const userInfo = storedUser ? JSON.parse(storedUser) : null;
    if (userInfo?.schoolId) schoolId = userInfo.schoolId;
  } catch (e) {
    // ignore
  }

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  return api.get(`/events/${schoolId}`);
};

export const fetchCalendarEvents = fetchEvents;

export const fetchMessages = () => api.get("/admin/messages");

export default api;
