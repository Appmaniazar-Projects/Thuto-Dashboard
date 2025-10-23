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
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import subjectService from '../../services/subjectService';
import gradeService from '../../services/gradeService';
import { getUsersByRole } from '../../services/adminService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';


const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const schoolId = localStorage.getItem('schoolId') || adminInfo.schoolId;
  const [formData, setFormData] = useState({ name: '', description: '', gradeIds: [], schoolId: schoolId });
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subjectsData, teachersData, gradesData] = await Promise.all([
        subjectService.getSchoolSubjects(),
        getUsersByRole('teacher'),
        gradeService.getSchoolGrades()
      ]);
      
      // Process subjects data with teacher assignments
      const processedSubjects = Array.isArray(subjectsData) ? subjectsData.map(subject => ({ 
        id: subject.id, 
        name: subject.name, 
        description: subject.description,
        gradeIds: subject.gradeIds || [],
        schoolId: subject.schoolId,
        assignedTeacher: subject.assignedTeacher || null, // Include teacher assignment info
        teacher: subject.teacher || null // Alternative teacher field
      })) : [];
      
      setSubjects(processedSubjects);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = () => {
    setDialogMode('create');
    setFormData({ name: '', description: '', gradeIds: [], schoolId: schoolId });
    setSelectedSubject(null);
    setOpenDialog(true);
  };

  const handleEditSubject = (subject) => {
    setDialogMode('edit');
    setFormData({ 
      name: subject.name, 
      description: subject.description || '',
      gradeIds: subject.gradeIds || [],
      schoolId: subject.schoolId || null
    });
    setSelectedSubject(subject);
    setOpenDialog(true);
  };

  const handleSubmitSubject = async () => {
    try {
      if (dialogMode === 'create') {
        await subjectService.createSubject(formData);
      } else {
        await subjectService.updateSubject(selectedSubject.id, formData);
      }
      setOpenDialog(false);
      loadData();
    } catch (err) {
      setError('Failed to save subject: ' + err.message);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.deleteSubject(subjectId);
        loadData();
      } catch (err) {
        setError('Failed to delete subject: ' + err.message);
      }
    }
  };

  const handleOpenAssignDialog = (subject) => {
    setSelectedSubject(subject);
    setSelectedTeacher(null);
    setOpenAssignDialog(true);
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher || !selectedSubject) {
      setError('Please select a teacher to assign.');
      return;
    }

    try {
      setAssignLoading(true);
      setError('');
      await subjectService.assignTeacherToSubject(selectedSubject.id, selectedTeacher.id);
      setOpenAssignDialog(false);
      setSelectedTeacher(null);
      await loadData(); // Reload data to show updated assignments
    } catch (err) {
      console.error('Error assigning teacher:', err);
      setError('Failed to assign teacher. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  const getSubjectStats = (subject) => {
    // Check if subject has direct teacher assignment from backend
    if (subject.assignedTeacher) {
      return {
        teacherCount: 1,
        teacherName: subject.assignedTeacher.name || 'Unknown Teacher',
        teacherId: subject.assignedTeacher.id
      };
    }
    
    // Check if subject has teacher info in different format
    if (subject.teacher) {
      return {
        teacherCount: 1,
        teacherName: subject.teacher.name || subject.teacher,
        teacherId: subject.teacher.id || null
      };
    }
    
    // Fallback: Find teacher assigned to this specific subject
    const assignedTeacher = teachers.find(t => 
      t.subject === subject.name || 
      (t.subjects && t.subjects.some(s => s.id === subject.id || s.name === subject.name))
    );
    
    return {
      teacherCount: assignedTeacher ? 1 : 0,
      teacherName: assignedTeacher ? assignedTeacher.name : 'Not assigned',
      teacherId: assignedTeacher?.id || null
    };
  };

  if (loading) return <LoadingSpinner message="Loading subject management..." />;
  if (error) return <ErrorDisplay message={error} onRetry={loadData} />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Subject Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSubject}
        >
          Create Subject
        </Button>
      </Box>

      {/* Subject Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">{subjects.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Subjects
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
                <PersonIcon sx={{ mr: 2, color: 'success.main' }} />
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h6">
                    {subjects.reduce((total, subject) => total + getSubjectStats(subject).teacherCount, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subject Assignments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Subjects Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Grades</TableCell>
              <TableCell align="center">Teachers</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => {
              const stats = getSubjectStats(subject);
              return (
                <TableRow key={subject.id}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {subject.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {subject.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                      {subject.gradeIds && subject.gradeIds.length > 0 ? (
                        subject.gradeIds.map(gradeId => {
                          const grade = grades.find(g => g.id === gradeId);
                          return (
                            <Chip 
                              key={gradeId}
                              label={grade ? grade.name : `Grade ${gradeId}`}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                          );
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary">No grades</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={stats.teacherCount} 
                          color={stats.teacherCount > 0 ? "success" : "default"} 
                          size="small"
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {stats.teacherName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      onClick={() => handleEditSubject(subject)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleOpenAssignDialog(subject)}
                      color="success"
                      size="small"
                      title="Assign Teacher"
                    >
                      <PersonIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteSubject(subject.id)}
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

      {subjects.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No subjects found. Create your first subject to get started.
        </Alert>
      )}

      {/* Create/Edit Subject Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Subject' : 'Edit Subject'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Mathematics, English, Science"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the subject"
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={grades}
            getOptionLabel={(grade) => grade.name || `Grade ${grade.id}`}
            value={grades.filter(grade => formData.gradeIds.includes(grade.id))}
            onChange={(event, newValue) => {
              setFormData({ 
                ...formData, 
                gradeIds: newValue.map(grade => grade.id) 
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Grades"
                placeholder="Choose grades for this subject"
                helperText="Select which grades this subject will be taught to"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.name || `Grade ${option.id}`}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitSubject} variant="contained">
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Assignment Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Assign Teacher to {selectedSubject?.name}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a teacher to assign to <strong>{selectedSubject?.name}</strong>
          </Typography>
          <Autocomplete
            options={teachers.filter(t => {
              // Filter out teachers already assigned to this subject
              const stats = getSubjectStats(selectedSubject || {});
              return !stats.teacherId || stats.teacherId !== t.id;
            })}
            getOptionLabel={(teacher) => {
              const name = teacher.name || 'Unknown';
              const phone = teacher.phoneNumber || teacher.phone || 'No phone';
              return `${name} (${phone})`;
            }}
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
            noOptionsText="No available teachers"
            sx={{ mt: 2 }}
            disabled={assignLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenAssignDialog(false);
              setSelectedTeacher(null);
              setError('');
            }}
            disabled={assignLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssignTeacher}
            variant="contained"
            disabled={!selectedTeacher || assignLoading}
            startIcon={assignLoading ? <div>Loading...</div> : null}
          >
            {assignLoading ? 'Assigning...' : 'Assign Teacher'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectManagement;
