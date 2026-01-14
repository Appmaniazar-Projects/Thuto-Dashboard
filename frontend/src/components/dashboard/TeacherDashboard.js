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
  CloudUpload as CloudUploadIcon,
  Event as EventIcon,
  Message as MessageIcon,
  Info as InfoIcon,
  Folder as FolderIcon,
  FilterAlt as FilterIcon,
  School as SchoolIcon  
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import subjectService from '../../services/subjectService';
import gradeService from '../../services/gradeService';
import StatCard from '../common/StatCard';
import { getUserDisplayName } from '../../utils/appText';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [resources, setResources] = useState([]);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states (kept for potential future use, but not shown in UI)
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

        const schoolId = user.schoolId || user.school?.id || localStorage.getItem('schoolId') || null;
        
        // Fetch resources, subjects, grades, and students in parallel
        const [resourceData, subjectsRaw, allGradesRaw, studentsData] = await Promise.all([
          teacherService.getRecentResources().catch(err => {
            console.error('Failed to fetch recent resources for dashboard:', err);
            return [];
          }),
          subjectService.getSubjectsByTeacher(teacherId).catch(err => {
            console.error('Failed to fetch teacher subjects for dashboard:', err);
            return [];
          }), // Get teacher's subjects
          gradeService.getSchoolGrades(schoolId).catch(err => {
            console.error('Failed to fetch school grades for teacher dashboard:', err);
            return [];
          }),
          teacherService.getTeacherStudents().catch(err => {
            console.error('Failed to fetch teacher students for dashboard:', err);
            return [];
          })
        ]);

        const normalizedResources = Array.isArray(resourceData)
          ? resourceData
          : Array.isArray(resourceData?.data)
            ? resourceData.data
            : Array.isArray(resourceData?.resources)
              ? resourceData.resources
              : [];

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

        setResources(normalizedResources);
        setTeacherSubjects(subjectsData || []);
        setTeacherGrades(derivedTeacherGrades);
        setTeacherStudents(Array.isArray(studentsData) ? studentsData : []);
        
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

  // Apply filters to resources
const filteredResources = useMemo(() => {
  if (!Array.isArray(resources)) {
    return [];
  }
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
      totalStudents: teacherStudents.length,
      subjectGradeCombinations: teacherSubjects.length * teacherGrades.length
    };
  }, [teacherSubjects, teacherGrades, filteredResources, teacherStudents]);

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
          Welcome, {getUserDisplayName(user)}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
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

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Announcements */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Announcements</Typography>
            <Paper sx={{ p: 2, height: 200, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
              <Box>
                <AnnounceIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" color="text.secondary">Announcements</Typography>
                <Typography variant="body2" color="text.secondary">Feature coming soon</Typography>
              </Box>
            </Paper>
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
              startIcon={<AttendanceIcon />}
              component={RouterLink}
              to="/teacher/attendance"
              sx={{ mb: 2 }}
            >
              Take Attendance
            </Button>
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
              startIcon={<CloudUploadIcon />}
              component={RouterLink}
              to="/teacher/upload-report"
              sx={{ mb: 2 }}
            >
              Upload Report
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AnnounceIcon />}
              disabled
              sx={{
                justifyContent: 'flex-start',
                '& .MuiButton-startIcon': { mr: 1 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Post Announcement
                </Box>
                <Chip
                  label="Coming Soon"
                  size="small"
                  sx={{ flexShrink: 0, height: 20, '& .MuiChip-label': { px: 1 } }}
                />
              </Box>
            </Button>
          </Paper>

          {/* Today's Classes */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Today's Classes</Typography>
            <Paper sx={{ p: 2, height: 200, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
              <Box>
                <SchoolIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" color="text.secondary">Class Schedule</Typography>
                <Typography variant="body2" color="text.secondary">Feature coming soon</Typography>
              </Box>
            </Paper>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;