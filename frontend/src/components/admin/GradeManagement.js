import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import gradeService from '../../services/gradeService';
import { getUsersByRole } from '../../services/adminService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';

const GradeManagement = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [assignMode, setAssignMode] = useState('student'); // 'student' or 'teacher'
  const [formData, setFormData] = useState({ name: '' });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [gradesData, studentsData, teachersData] = await Promise.all([
        gradeService.getSchoolGrades(),
        getUsersByRole('student'),
        getUsersByRole('teacher')
      ]);

      const processedGrades = Array.isArray(gradesData)
        ? gradesData.map((grade) => ({
            ...grade,
            id: grade.id ?? grade.gradeId ?? grade.idGrade,
            name: grade.name ?? grade.gradeName ?? grade.displayName ?? 'Unnamed Grade',
          }))
        : [];

      const processedStudents = Array.isArray(studentsData) ? studentsData : [];
      const processedTeachers = Array.isArray(teachersData) ? teachersData : [];
      
      setGrades(processedGrades);
      setStudents(processedStudents);
      setTeachers(processedTeachers);
    } catch (err) {
      console.error('Error loading grade management data:', err);
      setError('Failed to load data: ' + err.message);
      // Set empty arrays as fallback
      setGrades([]);
      setStudents([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrade = () => {
    setDialogMode('create');
    setFormData({ name: '' });
    setSelectedGrade(null);
    setOpenDialog(true);
  };

  const handleEditGrade = (grade) => {
    setDialogMode('edit');
    setFormData({ name: grade.name });
    setSelectedGrade(grade);
    setOpenDialog(true);
  };

  const handleSubmitGrade = async () => {
    try {
      if (dialogMode === 'create') {
        await gradeService.createGrade(formData);
        setSuccessMessage(`Successfully created grade: ${formData.name}`);
      } else {
        await gradeService.updateGrade(selectedGrade.id, formData);
        setSuccessMessage(`Successfully updated grade: ${formData.name}`);
      }
      setOpenDialog(false);
      setShowSuccess(true);
      loadData();
    } catch (err) {
      setError('Failed to save grade: ' + err.message);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await gradeService.deleteGrade(gradeId);
        loadData();
      } catch (err) {
        setError('Failed to delete grade: ' + err.message);
      }
    }
  };

  const handleOpenAssignDialog = (grade, mode) => {
    setSelectedGrade(grade);
    setAssignMode(mode);
    setSelectedStudents([]);
    setSelectedTeacher(null);
    setOpenAssignDialog(true);
  };

  const handleAssignStudents = async () => {
    try {
      const assignmentPromises = selectedStudents.map(student => 
        gradeService.assignStudentToGrade(selectedGrade.id, student.id)
      );
      await Promise.all(assignmentPromises);
      
      setOpenAssignDialog(false);
      setSuccessMessage(`Successfully assigned ${selectedStudents.length} student(s) to ${selectedGrade.name}`);
      setShowSuccess(true);
      loadData();
    } catch (err) {
      setError('Failed to assign students: ' + err.message);
    }
  };

  const handleAssignTeacher = async () => {
    try {
      await gradeService.assignTeacherToGrade(selectedGrade.id, selectedTeacher.id);
      setOpenAssignDialog(false);
      setSuccessMessage(`Successfully assigned ${selectedTeacher.name} to ${selectedGrade.name}`);
      setShowSuccess(true);
      loadData();
    } catch (err) {
      setError('Failed to assign teacher: ' + err.message);
    }
  };

  const getGradeStats = (grade) => {
  console.log(`Grade ${grade.name} data:`, grade);
  
  let studentCount = 0;
  if (Array.isArray(grade.studentIds)) {
    studentCount = grade.studentIds.length;
  } else if (grade.studentIds) {
    studentCount = 1;
  }
  
  let teacherCount = 0;
  if (Array.isArray(grade.teacherIds)) {
    teacherCount = grade.teacherIds.length;
  } else if (grade.teacherIds) {
    teacherCount = 1;
  }
  
  let subjectCount = 0;
  if (Array.isArray(grade.subjectIds)) {
    subjectCount = grade.subjectIds.length;
  } else if (grade.subjectIds) {
    subjectCount = 1;
  }
  
  console.log(`Grade ${grade.name} stats:`, {
    studentCount,
    teacherCount,
    subjectCount,
    rawData: {
      studentIds: grade.studentIds,
      teacherIds: grade.teacherIds,
      subjectIds: grade.subjectIds
    }
  });
  
  return {
    studentCount,
    teacherCount,
    subjectCount
  };
};

  if (loading) return <LoadingSpinner message="Loading grade management..." />;
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Grade Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateGrade}
        >
          Create Grade
        </Button>
      </Box>

      {/* Grade Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">{grades.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Grades
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">{students.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h6">{teachers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Teachers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grades Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Grade Name</TableCell>
              <TableCell align="center">Students</TableCell>
              <TableCell align="center">Teachers</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="error" variant="h6" gutterBottom>
                      Error Loading Grades
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {error}
                    </Typography>
                    <Button variant="contained" onClick={loadData}>
                      Retry
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary" variant="h6">
                      No grades found
                    </Typography>
                    <Typography color="text.secondary">
                      Create your first grade to get started
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              grades.map((grade) => {
                const stats = getGradeStats(grade);
                return (
                  <TableRow key={grade.id}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {grade.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={stats.studentCount} 
                      color="primary" 
                      size="small"
                      onClick={() => handleOpenAssignDialog(grade, 'student')}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={stats.teacherCount} 
                      color="secondary" 
                      size="small"
                      onClick={() => handleOpenAssignDialog(grade, 'teacher')}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleEditGrade(grade)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenAssignDialog(grade, 'student')}
                      color="info"
                      size="small"
                      title="Assign Students"
                    >
                      <PeopleIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenAssignDialog(grade, 'teacher')}
                      color="success"
                      size="small"
                      title="Assign Teacher"
                    >
                      <SchoolIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteGrade(grade.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
               );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Grade Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Grade' : 'Edit Grade'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Grade Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Grade 8, Form 1, Year 9"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitGrade} variant="contained">
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Assign {assignMode === 'student' ? 'Students' : 'Teacher'} to {selectedGrade?.name}
        </DialogTitle>
        <DialogContent>
          {assignMode === 'student' ? (
            <Autocomplete
              multiple
              options={Array.isArray(students) ? students.filter(s => !s.grade || s.grade !== selectedGrade?.name) : []}
              getOptionLabel={(student) => `${student.name} ${student.lastName || ''}`}
              value={selectedStudents}
              onChange={(event, newValue) => setSelectedStudents(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Students"
                  placeholder="Choose students to assign"
                  helperText={students.length === 0 ? 'No students available' : `${students.length} students available`}
                />
              )}
              sx={{ mt: 2 }}
              noOptionsText="No available students"
            />
          ) : (
            <Autocomplete
              options={Array.isArray(teachers) ? teachers : []}
              getOptionLabel={(teacher) => teacher.name || 'Unknown Teacher'}
              value={selectedTeacher}
              onChange={(event, newValue) => setSelectedTeacher(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Teacher"
                  placeholder="Choose a teacher to assign"
                  helperText={teachers.length === 0 ? 'No teachers available' : `${teachers.length} teachers available`}
                />
              )}
              sx={{ mt: 2 }}
              noOptionsText="No available teachers"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button 
            onClick={assignMode === 'student' ? handleAssignStudents : handleAssignTeacher}
            variant="contained"
            disabled={assignMode === 'student' ? selectedStudents.length === 0 : !selectedTeacher}
          >
            Assign {assignMode === 'student' ? 'Students' : 'Teacher'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GradeManagement;
