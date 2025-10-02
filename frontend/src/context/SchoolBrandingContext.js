import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SchoolBrandingContext = createContext();

export const useSchoolBranding = () => {
  const context = useContext(SchoolBrandingContext);
  if (!context) {
    throw new Error('useSchoolBranding must be used within a SchoolBrandingProvider');
  }
  return context;
};

export const SchoolBrandingProvider = ({ children }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState({
    logo: null,
    schoolName: 'Thuto Dashboard',
    favicon: null
  });
  const [loading, setLoading] = useState(false);

  // Load school branding based on user's school
  useEffect(() => {
    if (user?.schoolId) {
      loadSchoolBranding(user.schoolId);
    }
  }, [user?.schoolId]);

  const loadSchoolBranding = async (schoolId) => {
    try {
      setLoading(true);
      // This would call the backend API to get school branding
      // For now, we'll use localStorage as a fallback
      const savedBranding = localStorage.getItem(`school_branding_${schoolId}`);
      if (savedBranding) {
        const parsedBranding = JSON.parse(savedBranding);
        setBranding(prev => ({ ...prev, ...parsedBranding }));
        applyBrandingToDOM(parsedBranding);
      }
    } catch (error) {
      console.error('Failed to load school branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSchoolBranding = async (schoolId, newBranding) => {
    try {
      setLoading(true);
      
      // Update local state
      const updatedBranding = { ...branding, ...newBranding };
      setBranding(updatedBranding);
      
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem(`school_branding_${schoolId}`, JSON.stringify(updatedBranding));
      
      // Apply branding to DOM
      applyBrandingToDOM(updatedBranding);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update school branding:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyBrandingToDOM = (brandingData) => {
    // Update document title
    if (brandingData.schoolName) {
      document.title = `${brandingData.schoolName} - Dashboard`;
    }
    
    // Update favicon if provided
    if (brandingData.favicon) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = brandingData.favicon;
      }
    }
  };

  const refreshBranding = async () => {
    if (user?.schoolId) {
      await loadSchoolBranding(user.schoolId);
    }
  };

  const resetToDefault = () => {
    const defaultBranding = {
      logo: null,
      schoolName: 'Thuto Dashboard',
      favicon: null
    };
    setBranding(defaultBranding);
    applyBrandingToDOM(defaultBranding);
  };

  const value = {
    branding,
    loading,
    updateSchoolBranding,
    refreshBranding,
    resetToDefault,
    applyBrandingToDOM
  };

  return (
    <SchoolBrandingContext.Provider value={value}>
      {children}
    </SchoolBrandingContext.Provider>
  );
};
