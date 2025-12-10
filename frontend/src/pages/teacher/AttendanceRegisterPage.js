import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Checkbox, Button, Avatar, TextField, 
  CircularProgress, Alert,
  Grid, Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { 
  submitTeacherAttendance
} from '../../services/attendanceService';
import teacherService from '../../services/teacherService';
import gradeService from '../../services/gradeService';
import subjectService from '../../services/subjectService';

const AttendanceRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(''); // display name
  const [selectedGradeId, setSelectedGradeId] = useState(''); // actual gradeId for API
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch teacher's grades on component mount
  // Inside AttendanceRegisterPage component

useEffect(() => {
  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Get teacher info
      const teacher = JSON.parse(localStorage.getItem('user') || '{}');
      const teacherId = teacher.id || teacher.phoneNumber;

      if (!teacherId) {
        throw new Error('Teacher information not found');
      }

      const schoolId =
        localStorage.getItem('schoolId') ||
        teacher.schoolId ||
        teacher.school?.id ||
        null;

      // Fetch teacher's subjects and all school grades
      const [subjectsRaw, allGradesRaw] = await Promise.all([
        subjectService.getSubjectsByTeacher(teacherId).catch(err => {
          console.error('Failed to fetch teacher subjects for attendance:', err);
          return [];
        }),
        gradeService.getSchoolGrades(schoolId).catch(err => {
          console.error('Failed to fetch school grades for attendance:', err);
          return [];
        }),
      ]);

      const subjectsData = Array.isArray(subjectsRaw) ? subjectsRaw : [];
      const allGrades = Array.isArray(allGradesRaw) ? allGradesRaw : [];

      const gradeMap = new Map(
        allGrades.map((grade) => {
          const id = grade.id ?? grade.gradeId ?? grade.idGrade;
          return [
            String(id),
            {
              ...grade,
              id,
              name: grade.name ?? grade.gradeName ?? grade.displayName ?? `Grade ${id}`,
            },
          ];
        })
      );

      const teacherGradeIds = new Set();
      const derivedTeacherGrades = [];

      subjectsData.forEach((subject) => {
        const subjectGradeIds = Array.isArray(subject.gradeIds)
          ? subject.gradeIds
          : subject.gradeId
          ? [subject.gradeId]
          : [];

        subjectGradeIds.forEach((gid) => {
          const key = String(gid);
          if (!teacherGradeIds.has(key)) {
            teacherGradeIds.add(key);
            const gradeFromMap = gradeMap.get(key);
            if (gradeFromMap) {
              derivedTeacherGrades.push(gradeFromMap);
            } else {
              derivedTeacherGrades.push({ id: gid, name: `Grade ${gid}` });
            }
          }
        });
      });

      setTeacherGrades(derivedTeacherGrades);

      if (!derivedTeacherGrades || derivedTeacherGrades.length === 0) {
        throw new Error('No grades found for this teacher');
      }

      const firstGrade = derivedTeacherGrades[0];
      const gradeId = firstGrade.id; // Use first grade automatically
      setSelectedGrade(firstGrade.name || `Grade ${gradeId}`); // For display only
      setSelectedGradeId(gradeId);

      // Fetch students for the selected grade
      const gradeDataRaw = await gradeService.getStudentsByGrade(gradeId).catch(err => {
        console.error(`Failed to fetch students for grade ${gradeId}:`, err);
        return [];
      });

      // Normalize response so we always work with an array
      const gradeData = Array.isArray(gradeDataRaw)
        ? gradeDataRaw
        : Array.isArray(gradeDataRaw?.data)
          ? gradeDataRaw.data
          : Array.isArray(gradeDataRaw?.students)
            ? gradeDataRaw.students
            : [];

      const studentsWithDefaults = gradeData.map(student => ({
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
      const teacher = JSON.parse(localStorage.getItem('user'));

      await submitTeacherAttendance({
        grade: selectedGradeId,
        teacherId: teacher.id,
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
              <TextField
                fullWidth
                label="Grade"
                value={selectedGrade || ''}
                InputProps={{
                  readOnly: true
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={format(attendanceDate, 'yyyy-MM-dd')}
                onChange={(e) => setAttendanceDate(parseISO(e.target.value))}
                InputLabelProps={{ shrink: true }}
                size="small"
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
                    <Box display="flex" gap={1} alignItems="center">
                      <Button
                        variant={student.status === 'present' ? 'contained' : 'outlined'}
                        color="success"
                        size="small"
                        onClick={() => {
                          setStudents(prev => prev.map(s => 
                            s.id === student.id 
                              ? { ...s, status: 'present' } 
                              : s
                          ));
                        }}
                        disabled={saving}
                      >
                        Present
                      </Button>
                      <Button
                        variant={student.status === 'late' ? 'contained' : 'outlined'}
                        color="warning"
                        size="small"
                        onClick={() => {
                          setStudents(prev => prev.map(s => 
                            s.id === student.id 
                              ? { ...s, status: 'late' } 
                              : s
                          ));
                        }}
                        disabled={saving}
                      >
                        Late
                      </Button>
                      <Button
                        variant={student.status === 'absent' ? 'contained' : 'outlined'}
                        color="error"
                        size="small"
                        onClick={() => {
                          setStudents(prev => prev.map(s => 
                            s.id === student.id 
                              ? { ...s, status: 'absent' } 
                              : s
                          ));
                        }}
                        disabled={saving}
                      >
                        Absent
                      </Button>
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