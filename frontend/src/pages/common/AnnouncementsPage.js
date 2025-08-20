import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, List, ListItem, ListItemText, Divider, Alert, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import { getAnnouncements } from '../../services/announcementService';
import PageTitle from '../../components/common/PageTitle';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await getAnnouncements();
        // Sort announcements by date, newest first
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnnouncements(sortedData);
      } catch (err) {
        setError('Failed to load announcements. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageTitle title="Announcements" subtitle="Stay updated with the latest news and events from the school." />
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Button
            variant="contained"
            component={RouterLink}
            to="/announcements/create"
            startIcon={<AddIcon />}
          >
            Create Announcement
          </Button>
        )}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Paper elevation={2} sx={{ mt: 2 }}>
          {announcements.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: 'center' }}>
              There are no announcements at this time.
            </Typography>
          ) : (
            <List disablePadding>
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={announcement.title}
                      secondary={
                        <>
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {announcement.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(announcement.createdAt).toLocaleDateString()} - Posted by {announcement.authorName || 'Admin'}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < announcements.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AnnouncementsPage;
