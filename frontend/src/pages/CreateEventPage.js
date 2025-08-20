import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Button,
  Alert,
  TextField
} from '@mui/material';
import { useSnackbar } from 'notistack';
import PageTitle from '../components/common/PageTitle';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (e) => {
    e.preventDefault();
    enqueueSnackbar('This feature is coming soon!', { variant: 'info' });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <PageTitle 
          title="Create Event" 
          subtitle="This feature is coming soon. Stay tuned for updates!" 
        />
      </Box>
      
      <Paper sx={{ p: 4, opacity: 0.7 }}>
        <Alert severity="info" sx={{ mb: 4 }}>
          <strong>Coming Soon!</strong> The events feature is currently under development.
        </Alert>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Event Title"
            disabled
            margin="normal"
            placeholder="Feature coming soon"
          />
          
          <TextField
            fullWidth
            label="Event Description"
            disabled
            margin="normal"
            multiline
            rows={4}
            placeholder="This feature will be available in an upcoming release."
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled
            >
              Create Event (Coming Soon)
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;
