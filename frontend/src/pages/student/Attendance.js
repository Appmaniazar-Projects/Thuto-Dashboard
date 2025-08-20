import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { CheckCircle as PresentIcon, Cancel as AbsentIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance, getAttendanceStats } from '../../services/attendanceService';

const StudentAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // Get date range for current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Fetch attendance records
        const records = await getStudentAttendance(user.id, firstDay, lastDay);
        setAttendanceRecords(records);
        
        // Fetch attendance statistics
        const statsData = await getAttendanceStats(user.id);
        setStats(statsData);
        
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user.id]);

  const getStatusIcon = (status) => {
    return status === 'PRESENT' ? (
      <PresentIcon style={{ color: theme.palette.success.main }} />
    ) : (
      <AbsentIcon style={{ color: theme.palette.error.main }} />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Attendance
      </Typography>
      
      {/* Stats Cards */}
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="subtitle2" color="textSecondary">Present</Typography>
          <Typography variant="h4">{stats.presentDays || 0} days</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="subtitle2" color="textSecondary">Absent</Typography>
          <Typography variant="h4">{stats.absentDays || 0} days</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
          <Typography variant="subtitle2" color="textSecondary">Attendance Rate</Typography>
          <Typography variant="h4">{stats.attendanceRate || 0}%</Typography>
        </Paper>
      </Box>

      {/* Attendance Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(record.status)}
                        <span style={{ 
                          color: record.status === 'PRESENT' ? 
                            theme.palette.success.main : 
                            theme.palette.error.main 
                        }}>
                          {record.status.toLowerCase()}
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell>{record.subjectName || 'N/A'}</TableCell>
                    <TableCell>{record.remarks || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No attendance records found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StudentAttendance;