import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, Button, Avatar, TextField, 
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
  Grid, Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { 
  submitTeacherAttendance 
} from '../../services/attendanceService';
import { getTeacherClasses } from '../../services/teacherService';
import { fetchStudentsForTeacher } from '../../services/api';

const AttendanceRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [attendanceType, setAttendanceType] = useState('full');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch teacher's classes on component mount
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        setLoading(true);
        const classes = await getTeacherClasses();
        setTeacherClasses(classes || []);
        
        // Auto-select first class if available
        if (classes && classes.length > 0) {
          setSelectedGrade(classes[0].grade);
          setSelectedSubject(classes[0].subject);
        }
      } catch (err) {
        console.error('Failed to fetch teacher classes:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load your classes',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, []);

  // Fetch students when grade and subject are selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGrade || !selectedSubject) {
        setStudents([]);
        return;
      }

      try {
        setLoading(true);
        const studentsData = await fetchStudentsForTeacher({ 
          grade: selectedGrade, 
          subject: selectedSubject 
        });
        
        // Initialize students with default attendance status
        const studentsWithAttendance = (studentsData.data || []).map(student => ({
          ...student,
          isPresent: true, // Default to present
          remarks: ''
        }));
        
        setStudents(studentsWithAttendance);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load students for selected class',
          severity: 'error'
        });
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedGrade, selectedSubject]);

  const handleSave = async () => {
    if (!selectedGrade || !selectedSubject) {
      setSnackbar({
        open: true,
        message: 'Please select both grade and subject',
        severity: 'error'
      });
      return;
    }

    if (students.length === 0) {
      setSnackbar({
        open: true,
        message: 'No students found for the selected class',
        severity: 'error'
      });
      return;
    }

    try {
      setSaving(true);
      await submitTeacherAttendance({
        grade: selectedGrade,
        subject: selectedSubject,
        date: format(attendanceDate, 'yyyy-MM-dd'),
        attendance: students.map(student => ({
          studentId: student.id,
          isPresent: student.isPresent,
          remarks: student.remarks || ''
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

  // Get unique grades and subjects from teacher's classes
  const availableGrades = [...new Set(teacherClasses.map(cls => cls.grade))];
  const availableSubjects = selectedGrade 
    ? [...new Set(teacherClasses.filter(cls => cls.grade === selectedGrade).map(cls => cls.subject))]
    : [];

  if (loading && teacherClasses.length === 0) {
    return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and filters */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" gutterBottom>Class Attendance</Typography>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={selectedGrade}
                  label="Grade"
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedSubject(''); // Reset subject when grade changes
                  }}
                >
                  {availableGrades.map((grade) => (
                    <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth disabled={!selectedGrade}>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedSubject}
                  label="Subject"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {availableSubjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Date"
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

        {/* Class Info Display */}
        {selectedGrade && selectedSubject && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6">
              {selectedGrade} - {selectedSubject} ({students.length} students)
            </Typography>
            <Typography variant="body2">
              Date: {format(attendanceDate, 'MMMM d, yyyy')} | Type: {attendanceType}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Student list */}
      {selectedGrade && selectedSubject ? (
        loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : students.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Absent</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar><PersonIcon /></Avatar>
                        <Box>
                          <Typography variant="body1">{student.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.studentId || student.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={student.isPresent}
                        onChange={() => {
                          setStudents(prev => prev.map(s => 
                            s.id === student.id 
                              ? { ...s, isPresent: true } 
                              : s
                          ));
                        }}
                        disabled={saving}
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={!student.isPresent}
                        onChange={() => {
                          setStudents(prev => prev.map(s => 
                            s.id === student.id 
                              ? { ...s, isPresent: false } 
                              : s
                          ));
                        }}
                        disabled={saving}
                        color="error"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Add remarks..."
                        value={student.remarks || ''}
                        onChange={(e) => {
                          setStudents(prev => prev.map(s => 
                            s.id === student.id 
                              ? { ...s, remarks: e.target.value } 
                              : s
                          ));
                        }}
                        disabled={saving}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No students found for {selectedGrade} - {selectedSubject}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please check if students are enrolled in this class.
            </Typography>
          </Paper>
        )
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Please select a grade and subject to view students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose from your assigned classes above.
          </Typography>
        </Paper>
      )}

      {/* Save button */}
      {students.length > 0 && (
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Present: {students.filter(s => s.isPresent).length} | 
            Absent: {students.filter(s => !s.isPresent).length}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSave}
            disabled={saving || !selectedGrade || !selectedSubject}
            startIcon={saving ? <CircularProgress size={20} /> : null}
            size="large"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Box>
      )}

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