import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
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
});

// ========== ADMIN DASHBOARD ENDPOINTS ==========

export const fetchEnrollmentStats = () => api.get('/admin/stats/enrollment');

export const fetchAttendanceStats = () => api.get('/admin/stats/attendance');

export const fetchStudents = () => api.get('/admin/students');

export const fetchCalendarEvents = () => api.get('/admin/calendar');

export const fetchMessages = () => api.get('/admin/messages');

export const fetchStudentsForTeacher = ({ grade, subject }) => api.get(`/teacher/students?grade=${grade}&subject=${subject}`);

export const submitAttendance = ({ grade, subject, date, attendance }) => api.post('/teacher/attendance', { grade, subject, date, attendance });

export default api;
