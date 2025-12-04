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

    // Add schoolId to requests that need it (exclude specific services and endpoints)
    const excludedPaths = [
      '/auth/',
      '/superadmin/',
      '/master/',
      '/attendance/',
      '/resources/',
      '/grades/',
      '/teacher/',
      '/admin/',
      '/parent/',
      '/users/',
      '/subjects/',
      '/student/'

    ];

    const shouldExcludeSchoolId = excludedPaths.some(path => config.url.includes(path));

    if (userData?.schoolId && !shouldExcludeSchoolId) {
      // Add schoolId as query parameter
      if (!config.params) {
        config.params = {};
      }
      
      // Only add if not already present
      if (!config.params.schoolId) {
        config.params.schoolId = userData.schoolId;
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
      // Handle unauthorized access
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("schoolId");
      window.location.href = "/login";
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

export const fetchCalendarEvents = () => api.get("/admin/calendar");

export const fetchMessages = () => api.get("/admin/messages");

export default api;
