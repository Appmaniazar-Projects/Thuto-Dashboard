import React from 'react';
import { Container, Paper, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { APP_TEXT } from '../../utils/appText';

const RegisterWelcome = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 6, mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {APP_TEXT.WELCOME_MESSAGE}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Please select the type of account you'd like to register:
        </Typography>

        <Stack spacing={2}>
          <Button variant="contained" size="large" onClick={() => navigate('/register/teacher')}>
            Register as Teacher
          </Button>
          <Button variant="contained" size="large" onClick={() => navigate('/register/user')}>
            Register as Parent or Student
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
            Already have an account? Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default RegisterWelcome;
