import api from './api';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

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

/** Admin Login
 * Handles admin authentication with email and password
 * @param {string} email - Admin's email address
 * @param {string} password - Admin's password
 * @returns {Promise<Object>} User data and auth token
 * @throws {Error} With specific error message for different failure scenarios
 */
const adminLogin = async (email, password) => {
  try {
    const response = await api.post('/admin/login', { email, password });
    
    if (!response.data) {
      throw new Error('No response data received from server');
    }
    
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      return response.data;
    }
    
    throw new Error('Authentication failed: No token received');
  } catch (error) {
    console.error('Admin login error:', error);
    
    // Handle different error scenarios with specific messages
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (status === 403) {
        throw new Error('Access denied. You do not have permission to access the admin panel.');
      } else if (status === 404) {
        throw new Error('Admin account not found. Please check your credentials.');
      } else if (status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (data && data.message) {
        throw new Error(data.message);
      } else {
        throw new Error(`Login failed with status ${status}. Please try again.`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request
      throw new Error(error.message || 'An error occurred during login. Please try again.');
    }
  }
};
  

/**
 * Handles superadmin login with email and password
 * @param {string} email - Superadmin's email address
 * @param {string} password - Superadmin's password
 * @returns {Promise<Object>} User data and auth token
 */
const superAdminLogin = async (email, password) => {
  const response = await api.post('/superadmins/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

/**
 * Handles superadmin registration
 * @param {Object} registrationData - Super admin registration data
 * @param {string} registrationData.phoneNumber - Phone number
 * @param {string} registrationData.name - First name
 * @param {string} registrationData.lastName - Last name
 * @param {string} registrationData.email - Email address
 * @param {string} registrationData.password - Password
 * @param {string} registrationData.role - Role (SUPERADMIN_NATIONAL or SUPERADMIN_PROVINCIAL)
 * @param {string} [registrationData.province] - Province (required for SUPERADMIN_PROVINCIAL)
 * @returns {Promise<Object>} Registration response
 */
const superAdminRegister = async (registrationData) => {
  const response = await api.post('/superadmins/auth/super/register', registrationData);
  return response.data;
};

/**
 * Logs out the current user by notifying the backend and clearing local storage.
 */
const logout = async () => {
  try {
    // Notify the backend to invalidate the token on the server side.
    await api.post('/auth/logout');
  } catch (error) {
    // Log the error but proceed with client-side cleanup regardless.
    console.error('Server logout failed:', error);
  } finally {
    // Always clear local storage to log the user out on the client side.
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); // Also clear refresh token
  }
};

/**
 * Refreshes the authentication token using the stored refresh token.
 * @returns {Promise<Object>} The new token data.
 */
const refreshToken = async () => {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await api.post('/auth/refresh-token', { refreshToken: currentRefreshToken });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    // The backend might also issue a new refresh token.
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
  }
  
  return response.data;
};

/*
* Sends a password reset email to the specified email address
 * @param {string} email - The email address to send the reset link to
 * @returns {Promise<Object>} Response from the server
 */
const forgotPassword = async (email) => {
  const response = await api.post('/superadmins/forgot-password', { email });
  return response.data;
};

/**
 * Gets the current user from localStorage
 * @returns {Object|null} Current user data or null if not logged in
 */
const getCurrentUser = () => {
  try {
    // Check for both regular user and superadmin data
    const storedUser = localStorage.getItem('user');
    const storedSuperAdmin = localStorage.getItem('superAdmin');
    
    if (storedSuperAdmin) {
      return JSON.parse(storedSuperAdmin);
    } else if (storedUser) {
      return JSON.parse(storedUser);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Resets the password using the reset token
 * @param {string} token - The reset token from the email
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} Response from the server
 */
const resetPassword = async (token, newPassword) => {
  const response = await api.post('/superadmins/reset-password', { 
    token, 
    newPassword 
  });
  return response.data;
};

const authService = {
  login,
  adminLogin,
  superAdminLogin,
  superAdminRegister,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};

export default authService;