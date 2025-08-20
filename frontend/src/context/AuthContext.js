import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedSchoolId = localStorage.getItem('schoolId');

      if (storedToken && storedUser && storedSchoolId) {
        try {
          // Set API authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          setSchoolId(storedSchoolId);

          // Optionally verify token is still valid
          const userResponse = await api.get('/auth/me');
          if (userResponse.data) {
            setCurrentUser(userResponse.data);
            setSchoolId(userResponse.data.schoolId);
            localStorage.setItem('user', JSON.stringify(userResponse.data));
            localStorage.setItem('schoolId', userResponse.data.schoolId);
          }
        } catch (err) {
          console.error('Error verifying stored auth data:', err);
          // Clear invalid stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('schoolId');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signup = async (email, password, additionalData = {}) => {
    try {
      setError('');
      setLoading(true);
      const userCredential = await api.post('/auth/signup', { email, password, ...additionalData });

      enqueueSnackbar('Account created successfully!', { variant: 'success' });
      return userCredential.data;
    } catch (err) {
      console.error('Signup Error:', err);
      setError(err.message);
      enqueueSnackbar(err.message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone) => {
    try {
      setError('');
      setLoading(true);

      const response = await api.post('/auth/login', { phoneNumber: phone });
      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('schoolId', user.schoolId);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set API authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setCurrentUser(user);
      setSchoolId(user.schoolId);

      enqueueSnackbar('Logged in successfully!', { variant: 'success' });
      return user;

    } catch (err) {
      console.error('Login Error:', err);
      let errorMessage = 'Failed to log in.';
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 8081.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid phone number. Please check your credentials.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setError('');
      setLoading(true);
      await api.post('/auth/reset-password', { email });
      enqueueSnackbar('Password reset email sent. Please check your inbox.', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Password Reset Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to send password reset email', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async (oobCode, newPassword) => {
    try {
      setError('');
      setLoading(true);
      await api.post('/auth/reset-password-confirm', { oobCode, newPassword });
      enqueueSnackbar('Your password has been reset successfully!', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Password Reset Confirmation Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to reset password', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear all stored data
      localStorage.removeItem('token');
      localStorage.removeItem('schoolId');
      localStorage.removeItem('user');
      
      // Clear API authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Reset state
      setCurrentUser(null);
      setSchoolId(null);
      
      enqueueSnackbar('Logged out successfully!', { variant: 'info' });
    } catch (err) {
      console.error('Logout Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to log out', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      setError('');
      setLoading(true);
      const response = await api.patch('/auth/me', updates);
      setCurrentUser(response.data);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Update Profile Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to update profile', { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setUser = (userData) => {
    if (userData) {
      setCurrentUser({
        ...userData,
        id: userData.id,
        email: userData.email,
        role: userData.role?.toLowerCase() || 'student',
        displayName: userData.name || userData.displayName || 'User',
        phoneNumber: userData.phoneNumber
      });
    } else {
      setCurrentUser(null);
    }
  };

  const value = {
    user: currentUser,
    currentUser,
    loading,
    error,
    signup,
    login,
    resetPassword,
    logout,
    updateUserProfile,
    setUser,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth };

export default AuthContext;