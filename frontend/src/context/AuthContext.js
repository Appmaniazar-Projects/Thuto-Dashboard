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
    if (!user || !user.role) {
      console.error("Invalid user object passed to setAuthData:", user);
      throw new Error("User must have a role");
    }
  
    localStorage.setItem('token', token);
  
    if (['superadmin', 'superadmin_national', 'superadmin_provincial'].includes(user.role)) {
      localStorage.setItem('superAdmin', JSON.stringify(user));
    } else {
      localStorage.setItem('user', JSON.stringify(user));
    }
  
    localStorage.setItem('userRole', user.role);
  
    if (user.province && ['superadmin_provincial', 'superadmin_national'].includes(user.role)) {
      localStorage.setItem('userProvince', user.province);
    } else {
      localStorage.removeItem('userProvince');
    }
  
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(user);
  };
  

  useEffect(() => {
    const initializeAuth = () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('token');
        
        // Check for both regular user and superadmin data
        let storedUser = localStorage.getItem('user');
        let storedSuperAdmin = localStorage.getItem('superAdmin');

        if (storedToken && (storedUser || storedSuperAdmin)) {
          // Set API authorization header for future use
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Parse stored user data - prioritize superAdmin if both exist
          let userData;
          if (storedSuperAdmin) {
            userData = JSON.parse(storedSuperAdmin);
          } else if (storedUser) {
            userData = JSON.parse(storedUser);
          }
          
          // Ensure user data has required properties
          if (userData && typeof userData === 'object' && userData.role) {
            userData = {
              id: userData.id || null,
              email: userData.email || null,
              role: userData.role.toLowerCase(), // enforce lowercase
              level: userData.level || null,
              province: userData.province || null,
              displayName: userData.name || userData.displayName || 'User',
              phoneNumber: userData.phoneNumber || null,
              ...userData
            };
            setCurrentUser(userData);
          } else {
            throw new Error('User data missing role');
          }          
        }
      } catch (err) {
        console.error('Error parsing stored auth data:', err);
        // Clear invalid stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('superAdmin');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userProvince');
        delete api.defaults.headers.common['Authorization'];
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      
      // Determine redirect path based on current user role
      const userRole = currentUser?.role;
      let redirectPath = '/login'; // default for students/teachers/parents
      
      if (['superadmin', 'superadmin_national', 'superadmin_provincial'].includes(userRole)) {
        redirectPath = '/superadmin/login';
      } else if (userRole === 'admin') {
        redirectPath = '/admin/login';
      }
      
      // Clear all stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('superAdmin');
      localStorage.removeItem('userProvince');
      
      // Clear API authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Reset state
      setCurrentUser(null);
      
      enqueueSnackbar('Logged out successfully!', { variant: 'info' });
      
      // Navigate to appropriate login screen
      navigate(redirectPath);
      
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