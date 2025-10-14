import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the context
const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.schoolId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/admin/students', {
        params: { schoolId: user.schoolId }
      });
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error loading student data:', error);
      setError(error.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate derived data
  const genderData = React.useMemo(() => {
    if (!students.length) return [];
    const male = students.filter(s => s.gender === 'male').length;
    const female = students.filter(s => s.gender === 'female').length;
    return [
      { name: 'Male', value: male },
      { name: 'Female', value: female }
    ];
  }, [students]);

  const totalEnrollment = students.length;

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        students,
        genderData,
        totalEnrollment,
        loading,
        error,
        refreshData: loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;