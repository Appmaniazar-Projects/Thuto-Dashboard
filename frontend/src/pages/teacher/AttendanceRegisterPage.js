import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyStudents, submitAttendance } from '../../services/teacherService';
import {
  Box, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, 
  TableBody, Paper, Typography, Grid, FormControl, InputLabel, 
  CircularProgress, Alert, ToggleButton, ToggleButtonGroup, TableContainer
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const AttendanceRegisterPage = () => {
  const { user: teacher } = useAuth();
  const [date, setDate] = useState(new Date());
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subject, setSubject] = useState(''); // Assuming teacher teaches one subject for now

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError('');
      try {
        const studentProfiles = await getMyStudents();
        setStudents(studentProfiles);
        // Initialize attendance for all students as 'Present'
        const initialAttendance = studentProfiles.reduce((acc, student) => {
          acc[student.id] = 'Present';
          return acc;
        }, {});
        setAttendance(initialAttendance);

        // Mock subject and grade from teacher profile
        if (teacher && teacher.subjects) {
          setSubject(teacher.subjects[0] || 'Default Subject');
        }

      } catch (err) {
        setError('Failed to fetch students.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [teacher]);

  const handleMark = (studentId, newStatus) => {
    if (newStatus !== null) { // Ensure a button was actually clicked
      setAttendance(prev => ({ ...prev, [studentId]: newStatus }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await submitAttendance({ 
        date, 
        attendance, 
        subject,
        grade: teacher.grades ? teacher.grades.join(', ') : 'Default Grade',
      });

      if (response.success) {
        setSuccess(response.message);
      } else {
        setError('Failed to submit attendance.');
      }
    } catch (err) {
      setError('An error occurred while submitting attendance.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Take Attendance</Typography>
        <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                renderInput={(params) => <FormControl fullWidth><InputLabel>Date</InputLabel><Box {...params} /></FormControl>}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Taking attendance for: <strong>{subject} - {teacher?.grades?.join(', ')}</strong>
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" type="submit" disabled={loading || students.length === 0}>
              {loading ? <CircularProgress size={24} /> : 'Submit Attendance'}
            </Button>
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Paper>

      {loading && students.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : students.length > 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Class Roster</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell align="center">
                      <ToggleButtonGroup
                        value={attendance[student.id] || 'Present'}
                        exclusive
                        onChange={(e, newStatus) => handleMark(student.id, newStatus)}
                        aria-label={`Attendance for ${student.name}`}
                      >
                        <ToggleButton value="Present" color="success">Present</ToggleButton>
                        <ToggleButton value="Late" color="warning">Late</ToggleButton>
                        <ToggleButton value="Absent" color="error">Absent</ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          {error || 'No students found for your classes.'}
        </Typography>
      )}
    </Box>
  );
};

export default AttendanceRegisterPage;