// components/dashboard/admin/AttendanceStats.js
import React, { useMemo } from 'react';
import { Paper, Typography } from '@mui/material';

const AttendanceStats = ({ attendanceData = [] }) => {
  // Calculate average attendance on frontend
  const averageAttendance = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) {
      return 0;
    }

    // Calculate attendance percentage from the data
    const totalRecords = attendanceData.length;
    const presentRecords = attendanceData.filter(record => 
      record.status === 'present' || record.status === 'Present'
    ).length;

    return totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
  }, [attendanceData]);

  return (
    <Paper elevation={2} sx={{ p: 2, height: 120, bgcolor: '#f5f5f5', borderLeft: '4px solid #2e7d32' }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Average Attendance
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', color: '#2e7d32' }}>
        {averageAttendance}%
      </Typography>
    </Paper>
  );
};

export default AttendanceStats;