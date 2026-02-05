import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Avatar, List, ListItem, 
  ListItemText, ListItemIcon, Divider, CircularProgress, 
  Alert, Button, Card, CardContent, CardHeader, IconButton,
  TextField, MenuItem, Chip, Badge
} from '@mui/material';
import {
  Event as EventIcon,
  Campaign as AnnounceIcon,
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon,
  FilterAlt as FilterIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Help as UnknownIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { formatDisplayDate, formatDisplayDateTime } from '../../utils/date';
import parentService from '../../services/parentService';
import StatCard from '../common/StatCard';

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for data
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceWarning, setAttendanceWarning] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    childId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: '' // all, present, absent, late
  });

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('ParentDashboard - User object:', user);
        console.log('ParentDashboard - Phone number:', user?.phoneNumber);
        
        // Check if user has phoneNumber
        if (!user?.phoneNumber) {
          console.error('ParentDashboard - No phone number found in user object');
          setError('Phone number not found. Please update your profile.');
          setLoading(false);
          return;
        }
        
        // Fetch children data first
        const childrenData = await parentService.getMyChildren(user.phoneNumber);
        if (childrenData && childrenData.length > 0) {
          setChildren(childrenData);
          setAttendanceWarning('');
          
          // Set default filter to first child
          if (!filters.childId && childrenData[0]?.id) {
            setFilters(prev => ({ ...prev, childId: childrenData[0].id }));
          }
          
          const month = Number(filters.month);
          const year = Number(filters.year);
          const startDate = Number.isFinite(year) && Number.isFinite(month)
            ? new Date(year, month - 1, 1)
            : null;
          const endDate = Number.isFinite(year) && Number.isFinite(month)
            ? new Date(year, month, 0)
            : null;

          // Fetch attendance for all children in parallel
          const attendancePromises = childrenData.map(child => 
            parentService.getChildAttendance(child.id, { startDate, endDate })
          );
          
          const attendanceResults = await Promise.allSettled(attendancePromises);
          const allAttendance = attendanceResults
            .filter(result => result.status === 'fulfilled' && result.value)
            .flatMap(result => result.value);
            
          setAttendance(allAttendance);

          const attendanceFailureCount = attendanceResults.filter(r => r.status === 'rejected').length;
          if (attendanceFailureCount > 0 && allAttendance.length === 0) {
            setAttendanceWarning('Attendance data is currently unavailable. Your linked children are still shown below.');
          }
          
          // Fetch other data in parallel
          const [announcementsRes, eventsRes] = await Promise.allSettled([
            parentService.getAnnouncements(),
            parentService.getUpcomingEvents()
          ]);
          
          setAnnouncements(announcementsRes.status === 'fulfilled' ? announcementsRes.value : []);
          setEvents(eventsRes.status === 'fulfilled' ? eventsRes.value : []);
          
        } else {
          // No children found - still show dashboard but with placeholder data
          setChildren([]);
          setAttendance([]);
          setAttendanceWarning('');
          setAnnouncements([]);
          setEvents([]);
        }
      } catch (err) {
        console.error('Error loading parent dashboard:', err);
        
        // Handle different error types - distinguish between API errors and empty data
        if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
          setError('Unable to connect to the server. Please check your connection and try again.');
        } else if (err.response?.status === 404) {
          // 404 might mean no data exists, which is not an error
          setChildren([]);
          setAttendance([]);
          setAttendanceWarning('');
          setAnnouncements([]);
          setEvents([]);
          setError('');
        } else {
          setError('Failed to load dashboard. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.month, filters.year]); // Only refetch when month/year changes

  // Apply filters to attendance data
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      const recordStudentId = record?.studentId ?? record?.student?.id;
      const matchesChild = !filters.childId || String(recordStudentId) === String(filters.childId);

      const recordStatus = (record?.status || '').toString().toLowerCase();
      const matchesStatus = !filters.status || recordStatus === String(filters.status).toLowerCase();
      
      const recordDate = new Date(record.date);
      const matchesMonth = recordDate.getMonth() + 1 === parseInt(filters.month);
      const matchesYear = recordDate.getFullYear() === parseInt(filters.year);
      
      return matchesChild && matchesStatus && matchesMonth && matchesYear;
    });
  }, [attendance, filters]);

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    const totalDays = filteredAttendance.length;
    const presentDays = filteredAttendance.filter(a => (a?.status || '').toString().toLowerCase() === 'present').length;
    const absentDays = filteredAttendance.filter(a => (a?.status || '').toString().toLowerCase() === 'absent').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage
    };
  }, [filteredAttendance]);

  const getChildGradeLabel = (child) => {
    if (child?.grade?.name) return child.grade.name;
    if (child?.grade) return child.grade;
    if (child?.gradeId) return child.gradeId;
    return '';
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <PresentIcon color="success" fontSize="small" />;
      case 'absent':
        return <AbsentIcon color="error" fontSize="small" />;
      case 'late':
        return <UnknownIcon color="warning" fontSize="small" />;
      default:
        return <UnknownIcon color="disabled" fontSize="small" />;
    }
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

  // Generate month options (all 12 months of the year)
  const monthOptions = [];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  for (let i = 0; i < 12; i++) {
    monthOptions.push({
      value: i + 1,
      label: monthNames[i]
    });
  }
  const currentDate = new Date();

  // Generate year options (current year and previous year)
  const yearOptions = [
    { value: currentDate.getFullYear(), label: currentDate.getFullYear() },
    { value: currentDate.getFullYear() - 1, label: currentDate.getFullYear() - 1 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Parent Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {formatDisplayDate(new Date())}
        </Typography>

        {children.length > 0 && attendanceWarning && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {attendanceWarning}
          </Alert>
        )}

        {/* Filter Section */}
        <Paper sx={{ p: 2, mt: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          
          <Grid container spacing={2}>
            {children.length > 1 && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Child"
                  name="childId"
                  value={filters.childId}
                  onChange={handleFilterChange}
                  size="small"
                >
                  {children.map(child => (
                    <MenuItem key={child.id} value={child.id}>
                      {child.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Month"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                size="small"
              >
                {monthOptions.map(month => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="Year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                size="small"
              >
                {yearOptions.map(year => (
                  <MenuItem key={year.value} value={year.value}>
                    {year.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="late">Late</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ height: '40px' }}
                onClick={() => setFilters({
                  childId: children[0]?.id || '',
                  month: new Date().getMonth() + 1,
                  year: new Date().getFullYear(),
                  status: ''
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
            title="Attendance %" 
            value={`${stats.attendancePercentage}%`}
            icon={<SchoolIcon />}
            color={stats.attendancePercentage >= 90 ? 'success' : stats.attendancePercentage >= 75 ? 'warning' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Present Days" 
            value={stats.presentDays}
            icon={<PresentIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Absent Days" 
            value={stats.absentDays}
            icon={<AbsentIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Days" 
            value={stats.totalDays}
            icon={<EventIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column - Attendance Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {filters.childId ? 
                  `${children.find(c => c.id === filters.childId)?.name || 'Child'}'s Attendance` : 
                  'Children\'s Attendance'}
              </Typography>
              <Button 
                size="small" 
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/parent/reports')}
              >
                View All
              </Button>
            </Box>
            
            {filteredAttendance.length === 0 ? (
              <Box textAlign="center" py={4}>
                <SchoolIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  {attendance.length === 0 ? 'No attendance records available yet.' : 'No records match your filters.'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {attendance.length === 0 
                    ? 'Attendance records will appear here once teachers start recording daily attendance.'
                    : 'Try adjusting your filters to see more records.'}
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filteredAttendance.slice(0, 5).map((record, index) => {
                  const child = children.find(c => c.id === record.studentId);
                  return (
                    <ListItem 
                      key={`${record.date}-${index}`}
                      sx={{ 
                        borderBottom: '1px solid', 
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(record.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">
                              {formatDisplayDate(record.date)}
                            </Typography>
                            <Chip 
                              label={record.status?.toUpperCase() || 'UNKNOWN'}
                              size="small"
                              sx={{ 
                                ml: 1,
                                bgcolor: (record.status || '').toString().toLowerCase() === 'present' ? 'success.light' : 
                                        (record.status || '').toString().toLowerCase() === 'absent' ? 'error.light' : 
                                        (record.status || '').toString().toLowerCase() === 'late' ? 'warning.light' : 'grey.300',
                                color: 'white',
                                fontWeight: 'medium'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary">
                              {record.subject || 'N/A'}
                              {child && children.length > 1 && ` • ${child.name}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.notes || 'No additional notes'}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {children.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Linked Children</Typography>
              <List disablePadding>
                {children.map((child) => (
                  <ListItem
                    key={child.id}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: filters.childId === child.id ? 'action.selected' : 'transparent'
                    }}
                    button
                    onClick={() => setFilters(prev => ({ ...prev, childId: child.id }))}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/parent/reports?studentId=${child.id}`);
                          }}
                        >
                          <EventIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/parent/academic?studentId=${child.id}`);
                          }}
                        >
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={child.name}
                      secondary={getChildGradeLabel(child) ? `Grade: ${getChildGradeLabel(child)}` : undefined}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Upcoming Events */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Upcoming Events</Typography>
              <Button 
                size="small" 
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/events')}
              >
                View All
              </Button>
            </Box>
            
            {events.length === 0 ? (
              <Paper sx={{ p: 2, height: 150, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                <Box>
                  <EventIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">Upcoming Events</Typography>
                  <Typography variant="body2" color="text.secondary">No events scheduled</Typography>
                </Box>
              </Paper>
            ) : (
              <List disablePadding>
                {events.slice(0, 3).map((event, index) => (
                  <ListItem 
                    key={event.id || index}
                    sx={{ 
                      borderBottom: '1px solid', 
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    button
                    component={Link}
                    to="/events"
                  >
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {formatDisplayDateTime(event.date)}
                          </Typography>
                          {event.location && (
                            <Typography component="span" variant="body2" color="text.secondary" display="block">
                              {event.location}
                            </Typography>
                          )}
                        </>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Announcements */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Announcements</Typography>
              <Button 
                size="small" 
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/announcements')}
              >
                View All
              </Button>
            </Box>
            
            {announcements.length === 0 ? (
              <Paper sx={{ p: 2, height: 150, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                <Box>
                  <AnnounceIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">Announcements</Typography>
                  <Typography variant="body2" color="text.secondary">No recent announcements</Typography>
                </Box>
              </Paper>
            ) : (
              <List disablePadding>
                {announcements.slice(0, 3).map((announcement, index) => (
                  <ListItem 
                    key={announcement.id || index}
                    sx={{ 
                      borderBottom: '1px solid', 
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <ListItemIcon>
                      <AnnounceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="medium">
                          {announcement.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {announcement.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            {formatDisplayDate(announcement.date)}
                          </Typography>
                        </>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard;