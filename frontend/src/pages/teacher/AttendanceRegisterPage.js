import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Avatar, TextField, 
  CircularProgress, Alert, Grid, Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person as PersonIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { submitTeacherAttendance } from '../../services/attendanceService';
import gradeService from '../../services/gradeService';
import subjectService from '../../services/subjectService';
import { getMyStudents } from '../../services/teacherService';

const AttendanceRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchTeacherGradesAndStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get teacher info
        const teacher = JSON.parse(localStorage.getItem('user') || '{}');
        const teacherId = teacher.id || teacher.phoneNumber;
        const schoolId = localStorage.getItem('schoolId') || teacher.schoolId || teacher.school?.id;

        if (!teacherId) {
          throw new Error('Teacher information not found. Please log in again.');
        }

        if (!schoolId) {
          throw new Error('School information not found. Please contact support.');
        }

        // Fetch teacher's subjects and all school grades
        const [subjectsRaw, allGradesRaw] = await Promise.all([
          subjectService.getSubjectsByTeacher(teacherId).catch(err => {
            console.error('Failed to fetch teacher subjects:', err);
            return [];
          }),
          gradeService.getSchoolGrades(schoolId).catch(err => {
            console.error('Failed to fetch school grades:', err);
            return [];
          })
        ]);

        const subjectsData = Array.isArray(subjectsRaw) ? subjectsRaw : [];
        const allGrades = Array.isArray(allGradesRaw) ? allGradesRaw : [];

        if (allGrades.length === 0) {
          throw new Error('No grades found for your school. Please contact your administrator.');
        }

        // Create a map of all grades for easy lookup
        const gradeMap = new Map(
          allGrades.map((grade) => {
            const id = grade.id ?? grade.gradeId ?? grade.idGrade;
            return [
              String(id),
              {
                ...grade,
                id,
                name: grade.name ?? grade.gradeName ?? grade.displayName ?? `Grade ${id}`
              }
            ];
          })
        );

        // Extract unique grade IDs from teacher's subjects
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
                // Fallback if grade not in map
                derivedTeacherGrades.push({ id: gid, name: `Grade ${gid}` });
              }
            }
          });
        });

        if (derivedTeacherGrades.length === 0) {
          throw new Error('No grades assigned to you. Please contact your administrator to assign subjects.');
        }

        setTeacherGrades(derivedTeacherGrades);

        // Auto-select first grade
        const firstGrade = derivedTeacherGrades[0];
        const gradeId = firstGrade.id;
        setSelectedGrade(firstGrade.name || `Grade ${gradeId}`);
        setSelectedGradeId(gradeId);

        // Fetch students for the first grade
        await fetchStudentsForGrade(gradeId);

      } catch (err) {
        console.error('Failed to initialize attendance page:', err);
        setError(err.message || 'Failed to load attendance page. Please try again.');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherGradesAndStudents();
  }, []);

  const fetchStudentsForGrade = async (gradeId) => {
    try {
      setLoading(true);
      
      // Fetch students assigned to the logged-in teacher
      const gradeDataRaw = await getMyStudents();

      // Normalize response - handle different response structures
      const gradeData = Array.isArray(gradeDataRaw)
        ? gradeDataRaw
        : Array.isArray(gradeDataRaw?.data)
        ? gradeDataRaw.data
        : Array.isArray(gradeDataRaw?.students)
        ? gradeDataRaw.students
        : [];

      // Initialize students with default attendance status
      const studentsWithDefaults = gradeData.map(student => ({
        ...student,
        status: 'present', // Default to present
        remarks: ''
      }));

      setStudents(studentsWithDefaults);
      setError(null);

    } catch (err) {
      console.error(`Failed to fetch students for grade ${gradeId}:`, err);
      setError(`Failed to load students for this grade. ${err.response?.status === 404 ? 'No students found.' : 'Please try again.'}`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGradeId) {
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
      const teacherId = teacher.id || teacher.phoneNumber;

      await submitTeacherAttendance({
        grade: selectedGradeId,
        teacherId: teacherId,
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
        message:
          err?.message ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          (typeof err.response?.data === 'string' ? err.response.data : null) ||
          'Failed to save attendance. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, status: newStatus } : s
    ));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, remarks } : s
    ));
  };

  if (loading && teacherGrades.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading attendance register...</Typography>
      </Box>
    );
  }

  if (error && teacherGrades.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error Loading Attendance</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
          Class Attendance Register
        </Typography>
        
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Grade"
                value={selectedGrade || ''}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
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

        {/* Class Info */}
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

        {/* Error Alert */}
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Student List */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : students.length > 0 ? (
        <>
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
                          <Typography variant="body1">{student.name || 'Unknown Student'}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.studentId || student.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center" justifyContent="center">
                        <Button
                          variant={student.status === 'present' ? 'contained' : 'outlined'}
                          color="success"
                          size="small"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          disabled={saving}
                        >
                          Present
                        </Button>
                        <Button
                          variant={student.status === 'late' ? 'contained' : 'outlined'}
                          color="warning"
                          size="small"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          disabled={saving}
                        >
                          Late
                        </Button>
                        <Button
                          variant={student.status === 'absent' ? 'contained' : 'outlined'}
                          color="error"
                          size="small"
                          onClick={() => handleStatusChange(student.id, 'absent')}
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
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        disabled={saving}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary and Save Button */}
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Present: {students.filter(s => s.status === 'present').length} | 
              Late: {students.filter(s => s.status === 'late').length} | 
              Absent: {students.filter(s => s.status === 'absent').length}
            </Typography>

            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSave}
              disabled={saving || !selectedGradeId}
              startIcon={saving ? <CircularProgress size={20} /> : null}
              size="large"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </Box>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No students found for {selectedGrade}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please check if students are enrolled in this grade.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => fetchStudentsForGrade(selectedGradeId)}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Paper>
      )}

      {/* Snackbar Notifications */}
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