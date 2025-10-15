import axios from "axios";

// Create axios instance - configured to use Railway backend
const api = axios.create({
  // Use Railway backend URL
  baseURL: `${process.env.REACT_APP_API_URL || 'https://soothing-magic-production-efff.up.railway.app'}/api`,
  timeout: 10000, // 10 second timeout
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

/**
 * Fetches students for a specific teacher
 * @param {string} teacherId - The ID of the teacher
 */
export const fetchStudentsForTeacher = ({ grade, subject }) =>
  api.get(`/teacher/students?grade=${grade}&subject=${subject}`);

export const fetchCalendarEvents = () => api.get("/admin/calendar");

export const fetchMessages = () => api.get("/admin/messages");

export default api;
