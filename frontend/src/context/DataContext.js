import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getUsersByRole } from '../services/adminService';

const DataContext = createContext();

// ─── Provider ────────────────────────────────────────────────────────────────

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const loadData = async () => {
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('superAdmin') || 'null');

    if (!user?.schoolId) return;

    // Normalize role to lowercase to handle "ADMIN", "admin", "SUPERADMIN", etc.
    const role = user.role?.toLowerCase() || '';
    const allowedRoles = ['admin', 'superadmin', 'superadmin_national', 'superadmin_regional', 'superadmin_provincial'];

    if (!allowedRoles.includes(role)) {
      console.log('DataContext: Skipping student load for role:', role);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const studentData = await getUsersByRole('student');
      // Normalize each student's role to lowercase for consistent filtering downstream
      const normalized = (studentData || []).map(s => ({
        ...s,
        role: s.role?.toLowerCase() || 'student',
        gender: s.gender?.toLowerCase() || ''
      }));
      setStudents(normalized);
    } catch (err) {
      console.error('DataContext: Error loading students:', err);
      setError(err.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Derived data (memoized so consumers don't re-render unnecessarily) ──────

  const genderData = useMemo(() => {
    if (!students.length) return [];
    const male   = students.filter(s => s.gender === 'male').length;
    const female = students.filter(s => s.gender === 'female').length;
    return [
      { name: 'Male',   value: male   },
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
        refreshData: loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// ─── Primary hook ─────────────────────────────────────────────────────────────

/**
 * Access all student data and derived stats.
 * Must be used inside <DataProvider>.
 */
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

// ─── Convenience hooks (all backed by the single DataContext fetch) ───────────

/**
 * Returns students list only.
 * Replaces the old standalone useStudentsData hook.
 */
export const useStudentsData = () => {
  const { students, loading, error } = useData();
  return { students, loading, error };
};

/**
 * Returns gender breakdown derived from the shared student list.
 * Replaces the old standalone useGenderData hook.
 */
export const useGenderData = () => {
  const { genderData, loading, error } = useData();
  return { genderData, loading, error };
};

/**
 * Returns total enrollment count derived from the shared student list.
 * Replaces the old standalone useEnrollmentStats hook.
 */
export const useEnrollmentStats = () => {
  const { totalEnrollment, loading, error } = useData();
  return { totalEnrollment, loading, error };
};

export default DataContext;