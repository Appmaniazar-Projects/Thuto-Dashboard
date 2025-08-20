import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Paper, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import PageTitle from '../../components/common/PageTitle';

const CreateAnnouncementPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (e) => {
    e.preventDefault();
    enqueueSnackbar('This feature is coming soon!', { variant: 'info' });
  };

  return (
    <Box>
      <PageTitle 
        title="Create Announcement" 
        subtitle="This feature is coming soon. Stay tuned for updates!" 
      />
      <Paper sx={{ p: 3, maxWidth: '800px', opacity: 0.7 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Coming Soon!</strong> The announcements feature is currently under development.
        </Alert>
        <TextField
          fullWidth
          required
          label="Title"
          disabled
          margin="normal"
          placeholder="Feature coming soon"
        />
        <TextField
          fullWidth
          required
          label="Content"
          disabled
          margin="normal"
          multiline
          rows={8}
          placeholder="This feature will be available in an upcoming release."
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            Go Back
          </Button>
          <Button type="submit" variant="contained" disabled>
            Publish Announcement (Coming Soon)
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateAnnouncementPage;
