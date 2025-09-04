import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAllStudents } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all students once when the provider mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchAllStudents();
        setStudents(response.data || []);
      } catch (err) {
        setError('Failed to load student data');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  return (
    <DataContext.Provider
      value={{
        students,
        genderData,
        totalEnrollment,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
