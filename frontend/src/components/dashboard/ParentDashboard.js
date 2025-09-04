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
  Help as UnknownIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import parentService from '../../services/parentService';
import StatCard from '../common/StatCard';

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for data
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
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
        
        // Fetch children data first
        const childrenData = await parentService.getMyChildren();
        if (childrenData && childrenData.length > 0) {
          setChildren(childrenData);
          
          // Set default filter to first child
          if (!filters.childId && childrenData[0]?.id) {
            setFilters(prev => ({ ...prev, childId: childrenData[0].id }));
          }
          
          // Fetch attendance for all children in parallel
          const attendancePromises = childrenData.map(child => 
            parentService.getChildAttendance(child.id, filters)
          );
          
          const attendanceResults = await Promise.allSettled(attendancePromises);
          const allAttendance = attendanceResults
            .filter(result => result.status === 'fulfilled' && result.value)
            .flatMap(result => result.value);
            
          setAttendance(allAttendance);
          
          // Fetch other data in parallel
          const [announcementsRes, eventsRes] = await Promise.allSettled([
            parentService.getAnnouncements(),
            parentService.getUpcomingEvents()
          ]);
          
          setAnnouncements(announcementsRes.status === 'fulfilled' ? announcementsRes.value : []);
          setEvents(eventsRes.status === 'fulfilled' ? eventsRes.value : []);
          
        } else {
          setError('No children found for this account.');
        }
      } catch (err) {
        console.error('Error loading parent dashboard:', err);
        setError('Failed to load dashboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.month, filters.year]); // Only refetch when month/year changes

  // Apply filters to attendance data
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      const matchesChild = !filters.childId || record.studentId === filters.childId;
      const matchesStatus = !filters.status || record.status === filters.status;
      
      const recordDate = new Date(record.date);
      const matchesMonth = recordDate.getMonth() + 1 === parseInt(filters.month);
      const matchesYear = recordDate.getFullYear() === parseInt(filters.year);
      
      return matchesChild && matchesStatus && matchesMonth && matchesYear;
    });
  }, [attendance, filters]);

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    const totalDays = filteredAttendance.length;
    const presentDays = filteredAttendance.filter(a => a.status === 'present').length;
    const absentDays = filteredAttendance.filter(a => a.status === 'absent').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    // Group by subject
    const subjectStats = filteredAttendance.reduce((acc, record) => {
      if (!acc[record.subject]) {
        acc[record.subject] = { present: 0, total: 0 };
      }
      acc[record.subject].total++;
      if (record.status === 'present') {
        acc[record.subject].present++;
      }
      return acc;
    }, {});
    
    return {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage,
      subjectStats
    };
  }, [filteredAttendance]);

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

  // Generate month options (last 6 months)
  const monthOptions = [];
  const currentDate = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    monthOptions.push({
      value: date.getMonth() + 1,
      label: date.toLocaleString('default', { month: 'long' })
    });
  }

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
              <Typography color="text.secondary" textAlign="center" py={4}>
                No attendance records found for the selected filters.
              </Typography>
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
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            <Chip 
                              label={record.status?.toUpperCase() || 'UNKNOWN'}
                              size="small"
                              sx={{ 
                                ml: 1,
                                bgcolor: record.status === 'present' ? 'success.light' : 
                                        record.status === 'absent' ? 'error.light' : 'grey.300',
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

          {/* Subject-wise Stats */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Subject-wise Attendance</Typography>
            {Object.keys(stats.subjectStats).length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={2}>
                No subject data available for the selected filters.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {Object.entries(stats.subjectStats).map(([subject, { present, total }]) => {
                  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
                  return (
                    <Grid item xs={12} sm={6} key={subject}>
                      <Box mb={1}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" fontWeight="medium">
                            {subject}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {present}/{total} days ({percentage}%)
                          </Typography>
                        </Box>
                        <Box 
                          sx={{
                            height: 8,
                            bgcolor: 'grey.200',
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{
                              height: '100%',
                              width: `${percentage}%`,
                              bgcolor: percentage >= 90 ? 'success.main' : 
                                      percentage >= 75 ? 'warning.main' : 'error.main',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
            <List disablePadding>
              <ListItem 
                button 
                component={Link} 
                to="/parent/children"
                sx={{ borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemIcon><PeopleIcon color="primary" /></ListItemIcon>
                <ListItemText primary="View All Children" />
                <ChevronRightIcon color="action" />
              </ListItem>
              <ListItem 
                button 
                component={Link} 
                to="/parent/reports"
                sx={{ borderRadius: 1, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                <ListItemText primary="View Attendance Reports" />
                <ChevronRightIcon color="action" />
              </ListItem>
              <ListItem 
                button 
                component={Link} 
                to="/parent/academic"
                sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
                <ListItemText primary="View Academic Reports" />
                <ChevronRightIcon color="action" />
              </ListItem>
            </List>
          </Paper>

          {/* Upcoming Events */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">Upcoming Events</Typography>
              <Button 
                size="small" 
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/calendar')}
              >
                View All
              </Button>
            </Box>
            
            {events.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={2}>
                No upcoming events.
              </Typography>
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
                    to={`/event/${event.id}`}
                  >
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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
              <Typography color="text.secondary" textAlign="center" py={2}>
                No recent announcements.
              </Typography>
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
                            {new Date(announcement.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
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