import { useEffect, useState } from 'react';
import { getAllUsers } from '../services/adminService';

export const useStudentsData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const allUsers = await getAllUsers();
        // Filter for students only
        const students = allUsers.filter(user => user.role === 'student');
        setStudents(students || []);
      } catch (err) {
        setError('Failed to load students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return { students, loading, error };
};

// Helper function to get gender data
const getGenderData = (students) => {
  if (!students.length) return [];
  const male = students.filter(s => s.gender === 'male').length;
  const female = students.filter(s => s.gender === 'female').length;
  return [
    { name: 'Male', value: male },
    { name: 'Female', value: female }
  ];
};

export const useGenderData = () => {
  const { students, loading, error } = useStudentsData();
  const genderData = getGenderData(students);
  
  return { genderData, loading, error };
};

export const useEnrollmentStats = () => {
  const { students, loading, error } = useStudentsData();
  return { totalEnrollment: students.length, loading, error };
};
