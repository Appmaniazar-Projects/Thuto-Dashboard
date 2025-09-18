import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, Button, Avatar, TextField, 
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Grid, Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { 
  getClassForAttendance, 
  getClassAttendance, 
  submitAttendance 
} from '../../services/attendanceService';

const AttendanceRegisterPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classData, setClassData] = useState({ students: [] });
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [attendanceType, setAttendanceType] = useState('full');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch class and attendance data
  useEffect(() => {
    const fetchData = async () => {
      if (!classId) return;
      
      try {
        setLoading(true);
        const classDetails = await getClassForAttendance(classId);
        
        try {
          const attendance = await getClassAttendance(classId, format(attendanceDate, 'yyyy-MM-dd'));
          setClassData({
            ...classDetails,
            students: classDetails.students.map(s => ({
              ...s,
              isPresent: attendance.students.find(as => as.studentId === s.id)?.isPresent ?? true
            }))
          });
        } catch {
          setClassData({
            ...classDetails,
            students: classDetails.students.map(s => ({ ...s, isPresent: true }))
          });
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load class data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, attendanceDate]);

  const handleSave = async () => {
    const attendanceRecords = classData.students.map(student => ({
      studentId: student.id,
      date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: student.attendanceStatus || false,     // true/false for present/absent
      remarks: student.remarks || ''
    }));
    try {
      setSaving(true);
      await submitAttendance({
        classId,
        date: format(attendanceDate, 'yyyy-MM-dd'),
        attendanceType,
        students: classData.students.map(s => ({
          studentId: s.id,
          isPresent: s.isPresent
        }))
      });
      
      setSnackbar({
        open: true,
        message: 'Attendance saved successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Save failed:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save attendance',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and filters */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" gutterBottom>Class Attendance</Typography>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                value={format(attendanceDate, 'yyyy-MM-dd')}
                onChange={(e) => setAttendanceDate(parseISO(e.target.value))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Attendance Type</InputLabel>
                <Select
                  value={attendanceType}
                  label="Attendance Type"
                  onChange={(e) => setAttendanceType(e.target.value)}
                >
                  <MenuItem value="full">Full Day</MenuItem>
                  <MenuItem value="morning">Morning Only</MenuItem>
                  <MenuItem value="afternoon">Afternoon Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Student list */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classData.students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar><PersonIcon /></Avatar>
                    <Box>
                      <div>{student.name}</div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>{student.studentId}</div>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Checkbox
                    checked={student.isPresent}
                    onChange={() => {
                      setClassData(prev => ({
                        ...prev,
                        students: prev.students.map(s => 
                          s.id === student.id 
                            ? { ...s, isPresent: !s.isPresent } 
                            : s
                        )
                      }));
                    }}
                    disabled={saving}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save button */}
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceRegisterPage;