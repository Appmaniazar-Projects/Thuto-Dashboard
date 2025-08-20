import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';
import PageTitle from '../../components/common/PageTitle';

const AnnouncementsPage = () => {
  const { user } = useAuth(); // Get user from auth context

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageTitle title="Announcements" subtitle="Stay updated with the latest news and events from the school." />
        <Button
          variant="contained"
          component={RouterLink}
          to="#"
          startIcon={<AddIcon />}
          disabled
          sx={{ cursor: 'not-allowed' }}
        >
          Create Announcement (Coming Soon)
        </Button>
      </Box>

      <Paper elevation={2} sx={{ mt: 3, p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Announcements Feature Coming Soon!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We're working hard to bring you the latest updates and announcements.
          This feature will be available in an upcoming release.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check back soon for exciting updates!
        </Typography>
      </Paper>
    </Box>
  );
};

export default AnnouncementsPage;
