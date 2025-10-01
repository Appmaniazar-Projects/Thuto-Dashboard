import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAllStudents } from '../services/api';

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all students when the provider mounts or user changes
  useEffect(() => {
    const loadData = async () => {
      // Don't load if no user is logged in
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      setLoading(true);
      setError(null);
      
      try {
        const isSuperAdmin = user?.role?.includes('SUPERADMIN');
        
        if (isSuperAdmin) {
          // For super admin, we might not need to load students
          // Or we could load a list of schools/admins instead
          const response = await api.get('/superadmin/dashboard');
          setDashboardData(response.data);
          return;
        }

        // For regular admins, only fetch students if we have a school context
        if (user.schoolId) {
          const response = await api.get('/admin/students', {
            params: { schoolId: user.schoolId }
          });
          setStudents(response.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load student data');
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
