import axios from "axios";

// Create axios instance - configured for mock mode (no backend required)
const api = axios.create({
  // baseURL removed for frontend-only mode
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Set mock school ID if not already set
if (!localStorage.getItem("schoolId")) {
  localStorage.setItem("schoolId", "1");
}

// Request interceptor - for future backend integration
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add schoolId as a query parameter to all requests
    const schoolId = localStorage.getItem("schoolId");
    if (schoolId) {
      config.params = {
        ...config.params,
        schoolId: schoolId,
      };
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
        "Unable to connect to server. Please ensure the backend is running on port 8081.";
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
export const fetchAllStudents = (filters = {}) => 
  api.get("/admin/students").then(response => {
    // Apply filters on the frontend
    let filteredData = [...(response.data || [])];
    
    if (filters.grade) {
      filteredData = filteredData.filter(student => student.grade === filters.grade);
    }
    
    if (filters.gender) {
      filteredData = filteredData.filter(student => student.gender === filters.gender);
    }
    
    if (filters.status) {
      filteredData = filteredData.filter(student => student.status === filters.status);
    }
    
    return { data: filteredData };
  });

/**
 * Fetches all staff data for frontend filtering
 * @param {Object} filters - Optional filters to apply on the frontend
 */
export const fetchAllStaff = (filters = {}) => 
  api.get("/admin/staff").then(response => {
    let filteredData = [...(response.data || [])];
    
    if (filters.role) {
      filteredData = filteredData.filter(staff => staff.role === filters.role);
    }
    
    if (filters.department) {
      filteredData = filteredData.filter(staff => staff.department === filters.department);
    }
    
    return { data: filteredData };
  });

export const fetchCalendarEvents = () => api.get("/admin/calendar");

export const fetchMessages = () => api.get("/admin/messages");

export const fetchStudentsForTeacher = ({ grade, subject }) =>
  api.get(`/teacher/students?grade=${grade}&subject=${subject}`);

export default api;
