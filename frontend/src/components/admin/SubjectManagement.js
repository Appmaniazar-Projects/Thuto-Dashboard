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
import { getUsersByRole } from '../../services/adminService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, teachersData] = await Promise.all([
        subjectService.getSchoolSubjects(),
        getUsersByRole('teacher')
      ]);
      setSubjects(subjectsData.map(subject => ({ id: subject.id, name: subject.name, description: subject.description })));
      setTeachers(teachersData);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = () => {
    setDialogMode('create');
    setFormData({ name: '', description: '' });
    setSelectedSubject(null);
    setOpenDialog(true);
  };

  const handleEditSubject = (subject) => {
    setDialogMode('edit');
    setFormData({ name: subject.name, description: subject.description || '' });
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
    try {
      await subjectService.assignTeacherToSubject(selectedSubject.id, selectedTeacher.id);
      setOpenAssignDialog(false);
      loadData();
    } catch (err) {
      setError('Failed to assign teacher: ' + err.message);
    }
  };

  const getSubjectStats = (subject) => {
    // Find teacher assigned to this specific subject (backend returns arrays)
    const assignedTeacher = teachers.find(t => 
      t.subject === subject.name || 
      (t.subjects && t.subjects.some(s => s.id === subject.id || s.name === subject.name))
    );
    return {
      teacherCount: assignedTeacher ? 1 : 0,
      teacherName: assignedTeacher ? assignedTeacher.name : 'Not assigned'
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
                    <Chip 
                      label={stats.teacherCount} 
                      color="secondary" 
                      size="small"
                      onClick={() => handleOpenAssignDialog(subject)}
                    />
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
          <Autocomplete
            options={teachers.filter(t => 
              !t.subject || 
              t.subject !== selectedSubject?.name ||
              (t.subjects && !t.subjects.some(s => s.id === selectedSubject?.id))
            )}
            getOptionLabel={(teacher) => `${teacher.name} (${teacher.phoneNumber})`}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignTeacher}
            variant="contained"
            disabled={!selectedTeacher}
          >
            Assign Teacher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectManagement;
