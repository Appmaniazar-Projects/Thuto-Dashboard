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
  Autocomplete
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
import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gradesData, studentsData, teachersData] = await Promise.all([
        gradeService.getSchoolGrades(),
        studentService.getAllStudents(),
        teacherService.getAllTeachers()
      ]);
      setGrades(gradesData.map(grade => ({ id: grade.id, name: grade.name })));
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
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
      } else {
        await gradeService.updateGrade(selectedGrade.id, formData);
      }
      setOpenDialog(false);
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
      for (const student of selectedStudents) {
        await gradeService.assignStudentToGrade(selectedGrade.id, student.id);
      }
      setOpenAssignDialog(false);
      loadData();
    } catch (err) {
      setError('Failed to assign students: ' + err.message);
    }
  };

  const handleAssignTeacher = async () => {
    try {
      await gradeService.assignTeacherToGrade(selectedGrade.id, selectedTeacher.id);
      setOpenAssignDialog(false);
      loadData();
    } catch (err) {
      setError('Failed to assign teacher: ' + err.message);
    }
  };

  const getGradeStats = (grade) => {
    const gradeStudents = students.filter(s => s.grade === grade.name || s.gradeId === grade.id);
    const gradeTeachers = teachers.filter(t => t.grades?.some(g => g.id === grade.id) || t.gradeIds?.includes(grade.id));
    return {
      studentCount: gradeStudents.length,
      teacherCount: gradeTeachers.length
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
            {grades.map((grade) => {
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
            })}
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
              options={students.filter(s => !s.grade || s.grade !== selectedGrade?.name)}
              getOptionLabel={(student) => `${student.name} ${student.lastName || ''}`}
              value={selectedStudents}
              onChange={(event, newValue) => setSelectedStudents(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Students"
                  placeholder="Choose students to assign"
                />
              )}
              sx={{ mt: 2 }}
            />
          ) : (
            <Autocomplete
              options={teachers}
              getOptionLabel={(teacher) => teacher.name}
              value={selectedTeacher}
              onChange={(event, newValue) => setSelectedTeacher(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Teacher"
                  placeholder="Choose a teacher to assign"
                />
              )}
              sx={{ mt: 2 }}
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
    </Box>
  );
};

export default GradeManagement;
