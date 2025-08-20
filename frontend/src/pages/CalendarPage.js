import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import PageTitle from '../components/common/PageTitle';

const CalendarPage = () => {
  return (
    <Box>
      <PageTitle 
        title="School Calendar" 
        subtitle="This feature is coming soon. Stay tuned for updates!" 
      />
      
      <Paper elevation={2} sx={{ p: 4, mt: 3, textAlign: 'center', opacity: 0.7 }}>
        <Alert severity="info" sx={{ mb: 3, justifyContent: 'center' }}>
          <strong>Coming Soon!</strong> The calendar feature is currently under development.
        </Alert>
        
        <Typography variant="h5" color="primary" gutterBottom>
          Calendar Feature Coming Soon!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We're working hard to bring you a comprehensive school calendar.
          This feature will be available in an upcoming release.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check back soon for exciting updates!
        </Typography>
      </Paper>
    </Box>
  );
};

export default CalendarPage;
