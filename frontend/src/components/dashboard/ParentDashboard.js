import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Avatar, List, ListItem, 
  ListItemText, ListItemIcon, Divider, CircularProgress, 
  Alert, Button, Card, CardContent, CardHeader, IconButton
} from '@mui/material';
import {
  Event as EventIcon,
  Campaign as CampaignIcon,
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import parentService from '../../services/parentService';

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch children data first
        const childrenData = await parentService.getMyChildren();
        if (childrenData && childrenData.length > 0) {
          setChildren(childrenData);
          
          // Fetch announcements and events in parallel
          try {
            const [announcementsRes, eventsRes] = await Promise.allSettled([
              parentService.getAnnouncements(),
              parentService.getUpcomingEvents()
            ]);
            
            // Handle announcements response
            if (announcementsRes.status === 'fulfilled') {
              setAnnouncements(announcementsRes.value || []);
            } else {
              console.warn('Failed to load announcements:', announcementsRes.reason);
            }
            
            // Handle events response
            if (eventsRes.status === 'fulfilled') {
              setEvents(eventsRes.value || []);
            } else {
              console.warn('Failed to load events:', eventsRes.reason);
            }
          } catch (err) {
            console.warn('Error loading dashboard data:', err);
            // Don't show error to user for these non-critical components
          }
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
  }, []);

  const quickLinks = [
    { text: 'My Children', path: '/parent/children', icon: <PeopleIcon /> },
    { text: 'Attendance', path: '/parent/reports', icon: <SchoolIcon /> },
  ];

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
          Welcome back, {user?.name || 'Parent'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {children.length > 0 
            ? `You have ${children.length} ${children.length === 1 ? 'child' : 'children'} registered`
            : 'No children registered yet.'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Announcements */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Announcements"
              action={
                <Button 
                  component={Link}
                  to="/announcements"
                  size="small"
                  endIcon={<ChevronRightIcon />}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {announcements.length > 0 ? (
                <List>
                  {announcements.slice(0, 3).map((announcement) => (
                    <ListItem key={announcement.id} disableGutters>
                      <ListItemIcon>
                        <CampaignIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={announcement.title}
                        secondary={announcement.summary}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" py={2}>
                  No announcements available
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader
              title="Upcoming Events"
              action={
                <Button 
                  component={Link}
                  to="/events"
                  size="small"
                  endIcon={<ChevronRightIcon />}
                >
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {events.length > 0 ? (
                <List>
                  {events.slice(0, 3).map((event) => (
                    <ListItem key={event.id} disableGutters>
                      <ListItemIcon>
                        <EventIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={`${new Date(event.date).toLocaleDateString()} • ${event.location || 'Location TBD'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" py={2}>
                  No upcoming events
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Quick Links" />
            <Divider />
            <CardContent>
              <List disablePadding>
                {quickLinks.map((link) => (
                  <ListItem 
                    key={link.text}
                    button 
                    component={Link} 
                    to={link.path}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText primary={link.text} />
                    <ArrowForwardIcon color="action" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard;