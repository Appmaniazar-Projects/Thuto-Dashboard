import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set mock school ID if not already set
if (!localStorage.getItem('schoolId')) {
  localStorage.setItem('schoolId', '1');
}

api.interceptors.request.use((config) => {
  // Add auth token to headers
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add schoolId as a query parameter to all requests
  const schoolId = localStorage.getItem('schoolId');
  if (schoolId) {
    config.params = {
      ...config.params,
      schoolId: schoolId,
    };
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running or not accessible');
      error.message = 'Unable to connect to server. Please ensure the backend is running on port 8081.';
    } else if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('schoolId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== ADMIN DASHBOARD ENDPOINTS ==========

export const fetchEnrollmentStats = () => api.get('/admin/stats/enrollment');

export const fetchAttendanceStats = () => api.get('/admin/stats/attendance');

export const fetchStudents = () => api.get('/admin/students');

//export const fetchCalendarEvents = () => api.get('/admin/calendar');

//export const fetchMessages = () => api.get('/admin/messages');

export const fetchStudentsForTeacher = ({ grade, subject }) => api.get(`/teacher/students?grade=${grade}&subject=${subject}`);

export const submitAttendance = ({ grade, subject, date, attendance }) => api.post('/teacher/attendance', { grade, subject, date, attendance });

export default api;
