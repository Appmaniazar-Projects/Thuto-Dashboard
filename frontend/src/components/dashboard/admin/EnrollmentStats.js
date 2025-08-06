// components/dashboard/admin/EnrollmentStats.js
import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { fetchEnrollmentStats } from '../../../services/api';

const EnrollmentStats = () => {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    fetchEnrollmentStats().then((res) => {
      setTotal(res.data?.total || 0);
    }).catch(() => setTotal('Error'));
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 2, height: 120, bgcolor: '#f5f5f5', borderLeft: '4px solid #1976d2' }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Total Enrollment
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
        {total !== null ? total : '...'}
      </Typography>
    </Paper>
  );
};

export default EnrollmentStats;