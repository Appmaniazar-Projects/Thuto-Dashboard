import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../services/firebase';
import api from '../services/api';

const auth = getAuth(app);

const AuthContext = createContext();

// Role utility functions
export const isParentRole = (role) => ['parent', 'guardian', 'sponsor', 'helper'].includes(role?.toLowerCase());

export const isGuardianRole = (role) => ['parent', 'guardian'].includes(role?.toLowerCase());

export const isSponsorRole = (role) => role?.toLowerCase() === 'sponsor';

export const isHelperRole = (role) => role?.toLowerCase() === 'helper';

export const getParentRoleLabel = (role) => {
  const roleLabels = {
    'parent': 'Parent',
    'guardian': 'Guardian',
    'sponsor': 'Sponsor',
    'helper': 'Temporary Guardian'
  };
  return roleLabels[role?.toLowerCase()] || 'Parent';
};

export const getParentRolePermissions = (role) => {
  const permissions = {
    'parent': ['full_access', 'attendance', 'reports', 'resources', 'communication'],
    'guardian': ['full_access', 'attendance', 'reports', 'resources', 'communication'],
    'sponsor': ['attendance', 'reports', 'limited_profile'],
    'helper': ['attendance', 'reports', 'temporary_access']
  };
  return permissions[role?.toLowerCase()] || permissions['parent'];
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const setAuthData = (user, token) => {
    if (!user || !user.role) {
      console.error("Invalid user object passed to setAuthData:", user);
      throw new Error("User must have a role");
    }
  
    localStorage.setItem('token', token);
  
    // Normalize role to lowercase before storing
    const normalizedUser = { 
        ...user, 
        role: user.role.toLowerCase(),
        schoolIds: Array.isArray(user.schoolIds) ? user.schoolIds : 
                  user.schoolId ? [user.schoolId] : []
      };

    if (['superadmin', 'superadmin_national', 'superadmin_regional', 'superadmin_provincial'].includes(normalizedUser.role)) {
      localStorage.setItem('superAdmin', JSON.stringify(normalizedUser));
    } else {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }
  
    localStorage.setItem('userRole', normalizedUser.role);
  
    if (normalizedUser.province && ['superadmin_provincial', 'superadmin_regional', 'superadmin_national'].includes(normalizedUser.role)) {
      localStorage.setItem('userProvince', normalizedUser.province);
    } else {
      localStorage.removeItem('userProvince');
    }

    if (normalizedUser.region && ['superadmin_regional', 'superadmin_national'].includes(normalizedUser.role)) {
      localStorage.setItem('userRegion', normalizedUser.region);
    } else {
      localStorage.removeItem('userRegion');
    }
  
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setCurrentUser(normalizedUser);
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
              level: userData.level?.toLowerCase() || null, // enforce lowercase on level too
              province: userData.province || null,
              region: userData.region || null,
              schoolId: userData.schoolId || userData.school_id || null,
              schoolIds: userData.schoolIds || [],       
              schools: userData.schools || [],            
              schoolName: userData.schoolName || null, 
              displayName: userData.name || userData.displayName || 'User',
              phoneNumber: userData.phoneNumber || null,
              ...userData,
              // Re-apply normalized values so spread doesn't overwrite them
              role: userData.role.toLowerCase(),
              level: userData.level ? userData.level.toLowerCase() : null,
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
        localStorage.removeItem('userRegion');
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
  
      // Save the user role BEFORE clearing the user
      const userRole = currentUser?.role;
  
      // Call backend logout endpoint if available
      if (currentUser?.id) {
        try {
          await api.post(`/auth/${currentUser.id}/logout`);
        } catch (apiError) {
          console.warn('Logout API failed, continuing client-side cleanup', apiError);
        }
      }
  
      // Firebase sign-out (for teacher/parent/student roles)
      try {
        await auth.signOut();
      } catch (firebaseError) {
        console.warn('Firebase signOut failed:', firebaseError);
      }
  
      // Clear stored session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('superAdmin');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userProvince');
      localStorage.removeItem('userRegion');
      delete api.defaults.headers.common['Authorization'];
  
      setCurrentUser(null);
      setError('');
  
      // Determine redirect path
      let redirectPath = '/landing';
      if (['superadmin', 'superadmin_national', 'superadmin_regional', 'superadmin_provincial'].includes(userRole)) {
        redirectPath = '/superadmin/login';
      }
  
      enqueueSnackbar('Logged out successfully!', { variant: 'info' });
      navigate(redirectPath, { replace: true });
  
    } catch (err) {
      console.error('Logout Error:', err);
      setError(err.message);
      enqueueSnackbar('Failed to log out', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  

  const updateUserProfile = async (updates) => {
    try {
      setError('');
      setLoading(true);
      const response = await api.patch('/auth/me', updates);

      // Merge with the existing user so we don't lose fields the backend
      // doesn't echo back (e.g. schoolId, level), then normalize role/level
      // casing the same way the rest of this file expects.
      const mergedUser = {
        ...currentUser,
        ...response.data,
        role: (response.data?.role || currentUser?.role || '').toLowerCase(),
        level: (response.data?.level || currentUser?.level || '')?.toLowerCase() || null,
      };

      setCurrentUser(mergedUser);

      // Without this, a refresh re-reads the stale pre-edit data straight from
      // localStorage (see the auth-init effect below), making saved changes
      // appear to have been lost even though the backend update succeeded.
      const isSuperAdminUser = [
        'superadmin', 'superadmin_national', 'superadmin_regional', 'superadmin_provincial'
      ].includes(mergedUser.role);
      localStorage.setItem(isSuperAdminUser ? 'superAdmin' : 'user', JSON.stringify(mergedUser));

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
        level: userData.level?.toLowerCase() || null,
        province: userData.province || null,
        region: userData.region || null,
        displayName: userData.name || userData.displayName || 'User',
        phoneNumber: userData.phoneNumber
      });
    } else {
      setCurrentUser(null);
    }
  };

  // All role checks use toLowerCase() to handle backend returning uppercase roles
  // e.g. "SUPERADMIN_NATIONAL" from JWT vs "superadmin_national" stored in localStorage
  const isMaster = () => currentUser?.level?.toLowerCase() === 'master';
  
  const isSuperAdmin = () =>
    ['superadmin', 'superadmin_national', 'superadmin_regional', 'superadmin_provincial']
      .includes(currentUser?.role?.toLowerCase());

  const isNationalSuperAdmin = () =>
    currentUser?.level?.toLowerCase() === 'national' ||
    currentUser?.role?.toLowerCase() === 'superadmin_national';

  const isRegionalSuperAdmin = () =>
    currentUser?.level?.toLowerCase() === 'regional' ||
    currentUser?.role?.toLowerCase() === 'superadmin_regional';

  const isProvincialSuperAdmin = () =>
    currentUser?.level?.toLowerCase() === 'provincial' ||
    currentUser?.role?.toLowerCase() === 'superadmin_provincial';

  const value = {
    user: currentUser,
    currentUser,
    loading,
    error,
    logout,
    updateUserProfile,
    setUser,
    setAuthData,
    selectedSchool,
    setSelectedSchool,
    isAuthenticated: !!currentUser,
    isMaster,
    isSuperAdmin,
    isNationalSuperAdmin,
    isRegionalSuperAdmin,
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