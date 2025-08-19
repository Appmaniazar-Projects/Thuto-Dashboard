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
    const storedSchoolId = localStorage.getItem('schoolId');
    if (storedSchoolId) {
      setSchoolId(storedSchoolId);
    }

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    const unsubscribe = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        setCurrentUser(userResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    unsubscribe();
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

  const login = async (phone, schoolId) => {
    try {
      setError('');
      setLoading(true);

      const response = await api.post('/auth/login', { phoneNumber: phone });
      const { token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('schoolId', schoolId);
      setSchoolId(schoolId);
      
      // After successful login, fetch user data
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);

      enqueueSnackbar('Logged in successfully!', { variant: 'success' });
      return userResponse.data;

    } catch (err) {
      console.error('Login Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to log in.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw err;
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
      localStorage.removeItem('token');
      localStorage.removeItem('schoolId');
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