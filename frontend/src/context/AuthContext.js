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

  const setAuthData = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.schoolId) {
      localStorage.setItem('schoolId', user.schoolId);
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setCurrentUser(user);
    if (user.schoolId) {
      setSchoolId(user.schoolId);
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedSchoolId = localStorage.getItem('schoolId');

        if (storedToken && storedUser) {
          // Set API authorization header for future use
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          
          if (storedSchoolId) {
            setSchoolId(storedSchoolId);
          }
        }
      } catch (err) {
        console.error('Error parsing stored auth data:', err);
        // Clear invalid stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('schoolId');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const resetPassword = async (email) => {
    // Mock password reset - replace with real API when backend is ready
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
    // Mock password reset confirmation - replace with real API when backend is ready
    try {
      setError('');
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    resetPassword,
    logout,
    updateUserProfile,
    setUser,
    setAuthData,
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