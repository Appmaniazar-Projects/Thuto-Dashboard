import React, { createContext, useContext, useEffect, useState } from 'react';
import parentService from '../services/parentService';

const ParentContext = createContext();

export const ParentProvider = ({ children }) => {
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);

  // Fetch all children data once when the provider mounts
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  
  // Skip if not a parent user
  if (!userData || userData.role !== 'PARENT') {
    setLoading(false);
    return;
  }

  const loadChildren = async () => {
    try {
      setLoading(true);
      const phoneNumber = userData.phoneNumber; // Already verified userData exists above
      
      console.log('ParentContext - User data:', userData);
      console.log('ParentContext - Phone number:', phoneNumber);
      
      if (!phoneNumber) {
        console.error('ParentContext - No phone number found in user data');
        setError('Phone number not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const data = await parentService.getMyChildren(phoneNumber);
      setChildrenData(data);
      // Auto-select first child if none selected
      if (data.length > 0 && !selectedChildId) {
        setSelectedChildId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load children data');
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  loadChildren();
}, [selectedChildId]); // Add selectedChildId to dependencies

  const selectedChild = childrenData.find(child => child.id === selectedChildId) || null;

  return (
    <ParentContext.Provider
      value={{
        children: childrenData,
        selectedChild,
        selectedChildId,
        setSelectedChildId,
        loading,
        error,
        refresh: () => {
          setLoading(true);
          return parentService.getMyChildren()
            .then(setChildrenData)
            .catch(setError)
            .finally(() => setLoading(false));
        }
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = () => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
};
