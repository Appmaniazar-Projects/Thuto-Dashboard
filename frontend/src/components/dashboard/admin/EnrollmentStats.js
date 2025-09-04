// components/dashboard/admin/EnrollmentStats.js
import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useEnrollmentStats } from '../../../hooks/useStudentsData';

const EnrollmentStats = () => {
  const { totalEnrollment, loading, error } = useEnrollmentStats();

  return (
    <Paper elevation={2} sx={{ p: 2, height: 120, bgcolor: '#f5f5f5', borderLeft: '4px solid #1976d2' }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Total Enrollment
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
        {loading ? '...' : error ? 'Error' : totalEnrollment}
      </Typography>
    </Paper>
  );
};

export default EnrollmentStats;