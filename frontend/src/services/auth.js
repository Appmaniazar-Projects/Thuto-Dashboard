import api from './api';
import { auth } from './firebase';

/**
 * Handles OTP-based login for Teachers, Students, and Parents
 * @param {string} phoneNumber - User's phone number (digits only, no formatting)
 * @returns {Promise<Object>} User data and auth token
 */
const login = async (phoneNumber) => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('No Firebase user found');
  
  const firebaseToken = await firebaseUser.getIdToken();
  const response = await api.post('/auth/login', { 
    phoneNumber: phoneNumber.replace(/\s+/g, ''), 
    firebaseToken 
  });
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

/**
 * Handles admin login with email and password
 * @param {string} email - Admin's email address
 * @param {string} password - Admin's password
 * @returns {Promise<Object>} User data and auth token
 */
const adminLogin = async (email, password) => {
  const response = await api.post('/auth/admin/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

/**
 * Handles superadmin login with email and password
 * @param {string} email - Superadmin's email address
 * @param {string} password - Superadmin's password
 * @returns {Promise<Object>} User data and auth token
 */
const superAdminLogin = async (email, password) => {
  const response = await api.post('/auth/superadmin/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

/**
 * Logs out the current user by clearing local storage
 */
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

/**
 * Gets the currently logged-in user from local storage
 * @returns {Object|null} The current user object or null if not logged in
 */
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const authService = {
  login,
  adminLogin,
  superAdminLogin,
  logout,
  getCurrentUser,
};

export default authService;