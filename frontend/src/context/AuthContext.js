import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../services/firebase';
import api from '../services/api';

const auth = getAuth(app);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const setAuthData = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Store level and province for Master/Superadmin roles
    if (user.level) {
      localStorage.setItem('userLevel', user.level);
    }
    if (user.province) {
      localStorage.setItem('userProvince', user.province);
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(user);
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Set API authorization header for future use
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Parse stored user data
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error('Error parsing stored auth data:', err);
        // Clear invalid stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear all stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userLevel');
      localStorage.removeItem('userProvince');
      
      // Clear API authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Reset state
      setCurrentUser(null);
      
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
        level: userData.level || null,
        province: userData.province || null,
        displayName: userData.name || userData.displayName || 'User',
        phoneNumber: userData.phoneNumber
      });
    } else {
      setCurrentUser(null);
    }
  };

  const isMaster = () => currentUser?.level === 'master';
  const isSuperAdmin = () => currentUser?.role === 'superadmin';
  const isProvincialSuperAdmin = () => currentUser?.level === 'provincial';

  const value = {
    user: currentUser,
    currentUser,
    loading,
    error,
    logout,
    updateUserProfile,
    setUser,
    setAuthData,
    isAuthenticated: !!currentUser,
    isMaster,
    isSuperAdmin,
    isProvincialSuperAdmin
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