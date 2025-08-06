import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
