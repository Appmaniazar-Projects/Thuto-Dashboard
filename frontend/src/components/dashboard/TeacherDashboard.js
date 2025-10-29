import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, Button, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Divider, Chip, Badge, Link, CircularProgress, Alert,
  TextField, MenuItem
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  CheckCircleOutline as AttendanceIcon,
  PeopleOutline as PeopleIcon,
  Campaign as AnnounceIcon,
  Event as EventIcon,
  Message as MessageIcon,
  Info as InfoIcon,
  Folder as FolderIcon,
  FilterAlt as FilterIcon,
  School as SchoolIcon  
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getRecentResources } from '../../services/teacherService';
import subjectService from '../../services/subjectService';
import gradeService from '../../services/gradeService';
import StatCard from '../common/StatCard';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    subject: '',
    grade: '',
    dateRange: 'thisWeek' // thisWeek, thisMonth, custom
  });

  // Fetch all necessary data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user data is available
        if (!user) {
          setError('Teacher information not available. Please log in again.');
          return;
        }
        
        // Get teacher identifier (prefer id, fallback to phoneNumber)
        const teacherId = user.id || user.phoneNumber;
        if (!teacherId) {
          setError('Teacher ID not found. Please log in again.');
          return;
        }
        
        // Fetch classes and resources in parallel
        const [resourceData, subjectsData, gradesData] = await Promise.all([
          getRecentResources(), // Get all resources
          subjectService.getSubjectsByTeacher(teacherId), // Get teacher's subjects
          gradeService.getGradesByTeacher(teacherId) // Get teacher's grades
        ]);
        setResources(resourceData || []);
        setTeacherSubjects(subjectsData || []);
        setTeacherGrades(gradesData || []);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Handle different error types - distinguish between API errors and empty data
        if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
          setError('Unable to connect to the server. Please check your connection and try again.');
        } else if (err.response?.status === 404) {
          // 404 might mean no data exists, which is not an error
          setResources([]);
          setTeacherSubjects([]);
          setTeacherGrades([]);
          setError('');
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Apply filters to classes
  // const filteredClasses = useMemo(() => {
  //   return classes.filter(cls => {
  //     return (
  //       (!filters.subject || cls.subject === filters.subject) &&
  //       (!filters.grade || cls.grade === filters.grade)
  //     );
  //   });
  // }, [classes, filters]);

  // Apply filters to resources
const filteredResources = useMemo(() => {
  return resources.filter(resource => {
    if (filters.subject && resource.subjectId !== filters.subject) return false;
    if (filters.grade && resource.gradeId !== filters.grade) return false;
    return true;
  });
}, [resources, filters]);

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    return {
      totalSubjects: teacherSubjects.length,
      totalGrades: teacherGrades.length,
      totalResources: filteredResources.length,
      totalStudents: 0, // TODO: Fetch actual student count from backend
      subjectGradeCombinations: teacherSubjects.length * teacherGrades.length
    };
  }, [teacherSubjects, teacherGrades, filteredResources]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={() => window.location.reload()} color="inherit" size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome, {user?.name || 'Teacher'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>

        {/* Filter Section */}
        <Paper sx={{ p: 2, mt: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Subject"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {teacherSubjects.map(subject => (
                  <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Grade"
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="">All Grades</MenuItem>
              {teacherGrades.map(grade => (
                <MenuItem key={grade.id} value={grade.id}>{grade.name}</MenuItem>
              ))}
            </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ height: '40px' }}
                onClick={() => setFilters({
                  subject: '',
                  grade: '',
                  dateRange: 'thisWeek'
                })}
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Subjects" 
            value={stats.totalSubjects} 
            icon={<BookIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Grades" 
            value={stats.totalGrades} 
            icon={<SchoolIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Students" 
            value={stats.totalStudents} 
            icon={<PeopleIcon />}
            onClick={() => navigate('/teacher/students')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Resources" 
            value={stats.totalResources} 
            icon={<FolderIcon />}
            onClick={() => navigate('/teacher/resources')}
          />
        </Grid>
      </Grid>

      {/* Left Column */}
      <Grid item xs={12} md={8}>
        {/* Announcements */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">Announcements</Typography>
            <Chip 
              label="Coming Soon" 
              color="primary" 
              size="small"
              icon={<InfoIcon fontSize="small" />}
            />
          </Box>
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              The announcements feature is coming soon. You'll be able to post and manage class announcements here.
            </Typography>
          </Box>
        </Paper>

        {/* Recent Resources */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Recent Resources</Typography>
          {filteredResources.length === 0 ? (
            <Box textAlign="center" py={4}>
              <FolderIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                {resources.length === 0 ? 'No resources available yet.' : 'No resources match your filters.'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {resources.length === 0 
                  ? 'Upload your first resource to get started.' 
                  : 'Try adjusting your filters to see more resources.'}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredResources.map((resource, index) => (
                <ListItem key={resource.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary={resource.fileName}
                    secondary={`Uploaded on: ${new Date(resource.uploadDate).toLocaleDateString()}`}
                  />
                  <Button size="small" variant="outlined" href={resource.fileUrl} target="_blank">View</Button>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={4}>
        {/* Quick Actions */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AssignmentIcon />}
            component={RouterLink}
            to="/teacher/resources"
            sx={{ mb: 2 }}
          >
            Manage Resources
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AnnounceIcon />}
            disabled
          >
            Post Announcement
            <Chip 
              label="Coming Soon" 
              size="small" 
              sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1 } }} 
            />
          </Button>
        </Paper>

        {/* Today's Classes */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>Today's Classes</Typography>
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              The class schedule feature is coming soon. You'll be able to view and manage your daily classes here.
            </Typography>
          </Box>
        </Paper>
        
        {/* Recent Messages */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">Recent Messages</Typography>
            <Chip 
              label="Coming Soon" 
              color="primary" 
              size="small"
              icon={<InfoIcon fontSize="small" />}
            />
          </Box>
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              The messaging feature is coming soon.
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;