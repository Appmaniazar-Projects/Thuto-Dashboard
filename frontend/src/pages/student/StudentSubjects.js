import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  Subject as SubjectIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Book as BookIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import subjectService from '../../services/subjectService';

const subjectColors = {
  'Mathematics': '#1976d2',
  'Science': '#388e3c',
  'English Literature': '#7b1fa2',
  'History': '#f57c00',
  'Computer Science': '#303f9f',
  'Art': '#e91e63'
};

const StudentSubjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current student's ID from user context
        if (!user || !user.id) {
          throw new Error('Student ID not found. Please log in again.');
        }
        
        // Fetch subjects for this specific student using subjectService
        const studentSubjects = await subjectService.getSubjectsByStudent(user.id);
        
        // Check if student has any subjects
        if (!studentSubjects || studentSubjects.length === 0) {
          setSubjects([]);
          setError('No subjects assigned to you yet. Please contact your administrator.');
          return;
        }
        
        setSubjects(studentSubjects);
      } catch (err) {
        console.error('Failed to load subjects:', err);
        
        // Handle different error types - distinguish between API errors and empty data
        if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
          setError('Unable to connect to the server. Please check your connection and try again.');
        } else if (err.response?.status === 404) {
          // 404 might mean no subjects exist, which is not an error
          setSubjects([]);
          setError('');
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to load subjects. Please check your connection and try again.');
        }
        
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [user]);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSubject(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Subjects
      </Typography>

      {subjects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BookIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No subjects available yet.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Your subjects will appear here once they are assigned by your administrator.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {subjects.map((subject) => (
            <Grid item xs={12} sm={6} md={4} key={subject.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
                onClick={() => handleSubjectClick(subject)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SubjectIcon 
                      sx={{ 
                        color: subjectColors[subject.name] || '#757575',
                        fontSize: 40,
                        mr: 2
                      }} 
                    />
                    <Box>
                      <Typography variant="h6" component="div">
                        {subject.name}
                      </Typography>
                    {/* <Typography variant="body2" color="text.secondary">
                      {subject.code}
                      </Typography> */}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                     Teacher: {subject.teacher?.name || subject.teacherName || subject.assignedTeacher?.name || 'Not assigned'}
                  </Typography>
                  {/* <Typography variant="body2" color="text.primary">
                    {subject.room}
                  </Typography> */}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedSubject && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <SubjectIcon 
                  sx={{ 
                    color: subjectColors[selectedSubject.name] || '#757575',
                    mr: 2
                  }} 
                />
                {selectedSubject.name}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Description" 
                    secondary={selectedSubject.description}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText
                    primary="Teacher"
                    secondary={selectedSubject.teacher?.name || selectedSubject.teacherName || selectedSubject.assignedTeacher?.name || 'Not assigned'}
                    />
                </ListItem>
                <Divider component="li" />
                
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentSubjects;
