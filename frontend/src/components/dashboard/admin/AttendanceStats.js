// components/dashboard/admin/AttendanceStats.js
import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { fetchAttendanceStats } from '../../../services/api';

const AttendanceStats = () => {
  const [average, setAverage] = useState(null);

  useEffect(() => {
    fetchAttendanceStats().then((res) => {
      setAverage(res.data?.average || 0);
    }).catch(() => setAverage('Error'));
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 2, height: 120, bgcolor: '#f5f5f5', borderLeft: '4px solid #2e7d32' }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Average Attendance
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#2e7d32' }}>
        {average !== null ? `${average}%` : '...'}
      </Typography>
    </Paper>
  );
};

export default AttendanceStats;