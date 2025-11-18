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
  submitTeacherAttendance, getAttendanceByGrade
} from '../../services/attendanceService';
import gradeService from '../../services/gradeService';

const AttendanceRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch teacher's grades on component mount
  // Inside AttendanceRegisterPage component

useEffect(() => {
  const fetchStudents = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get teacher info
      const teacher = JSON.parse(localStorage.getItem('user'));
      const teacherId = teacher.id;

      // 2️⃣ Fetch teacher's assigned grades
      const grades = await gradeService.getGradesByTeacher(teacherId);

      if (!grades || grades.length === 0) {
        throw new Error("No grades found for this teacher");
      }

      const gradeId = grades[0].id; // Use first grade automatically
      setSelectedGrade(grades[0].name || gradeId); // For display only

      // 3️⃣ Fetch students using getAttendanceByGrade
      const gradeData = await getAttendanceByGrade(gradeId);

      const studentsWithDefaults = (gradeData?.students || []).map(student => ({
        ...student,
        status: 'present',
        remarks: ''
      }));

      setStudents(studentsWithDefaults);

    } catch (err) {
      console.error('Failed to fetch students:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load students for your grade',
        severity: 'error'
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  fetchStudents();
}, []);


  const handleSave = async () => {
    if (!selectedGrade) {
      setSnackbar({
        open: true,
        message: 'Please select a grade',
        severity: 'error'
      });
      return;
    }

    if (students.length === 0) {
      setSnackbar({
        open: true,
        message: 'No students found for the selected grade',
        severity: 'error'
      });
      return;
    }

    try {
      setSaving(true);
      await submitTeacherAttendance({
        grade: selectedGrade,
        date: format(attendanceDate, 'yyyy-MM-dd'),
        attendance: students.map(student => ({
          studentId: student.id,
          status: student.status,
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

  if (loading && teacherGrades.length === 0) {
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={selectedGrade}
                  label="Grade"
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  {teacherGrades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.name || grade.id}>
                      {grade.name || grade.id}
                    </MenuItem>
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
          </Grid>
        </Paper>

        {/* Class Info Display */}
        {selectedGrade && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6">
              {selectedGrade} ({students.length} students)
            </Typography>
            <Typography variant="body2">
              Date: {format(attendanceDate, 'MMMM d, yyyy')}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Student list */}
      {selectedGrade ? (
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
                  <TableCell align="center">Status</TableCell>
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
                    <TableCell>
                      <Box display="flex" gap={2} alignItems="center">
                        <Box display="flex" alignItems="center">
                          <Checkbox
                            checked={student.status === 'present'}
                            onChange={() => {
                              setStudents(prev => prev.map(s => 
                                s.id === student.id 
                                  ? { ...s, status: 'present' } 
                                  : s
                              ));
                            }}
                            disabled={saving}
                            color="success"
                          />
                          <Typography>Present</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Checkbox
                            checked={student.status === 'late'}
                            onChange={() => {
                              setStudents(prev => prev.map(s => 
                                s.id === student.id 
                                  ? { ...s, status: 'late' } 
                                  : s
                              ));
                            }}
                            disabled={saving}
                            color="warning"
                          />
                          <Typography>Late</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Checkbox
                            checked={student.status === 'absent'}
                            onChange={() => {
                              setStudents(prev => prev.map(s => 
                                s.id === student.id 
                                  ? { ...s, status: 'absent' } 
                                  : s
                              ));
                            }}
                            disabled={saving}
                            color="error"
                          />
                          <Typography>Absent</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
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
              No students found for {selectedGrade}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please check if students are enrolled in this grade.
            </Typography>
          </Paper>
        )
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Please select a grade to view students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose from your assigned grades above.
          </Typography>
        </Paper>
      )}

      {/* Save button */}
      {students.length > 0 && (
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Present: {students.filter(s => s.status === 'present').length} |
            Absent: {students.filter(s => s.status === 'absent').length}
          </Typography>

          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSave}
            disabled={saving || !selectedGrade}
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