import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const AnnouncementsPage = () => (
  <Container maxWidth="md">
    <Paper elevation={0} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
      <Box sx={{ mb: 3 }}>
        <ConstructionIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Announcements Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary">
        We're working on bringing you the latest updates and announcements.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This feature is currently under development and will be available in a future update.
      </Typography>
    </Paper>
  </Container>
);

export default AnnouncementsPage;
