import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import { getChildAttendance } from '../../services/parentService';

const AttendanceView = ({ childId }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!childId) {
      setAttendance([]);
      return;
    }

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getChildAttendance(childId);
        setAttendance(data);
      } catch (err) {
        setError('Failed to fetch attendance records.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [childId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }

  if (attendance.length === 0) {
    return <Typography sx={{ my: 2 }}>No attendance records found for this child.</Typography>;
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Teacher</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendance.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
              <TableCell>{record.subject}</TableCell>
              <TableCell>{record.status}</TableCell>
              <TableCell>{record.teacherName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceView;
