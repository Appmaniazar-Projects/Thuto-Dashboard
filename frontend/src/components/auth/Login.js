import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Link, Alert, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [schoolId, setSchoolId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('schoolId');
    if (id) {
      setSchoolId(id);
    } else {
      setError('No school identifier provided. Please access this page through your school\'s official website.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!schoolId) {
      setError('Cannot log in without a school identifier.');
      return;
    }

    try {
      await login(phone, schoolId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          User Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            autoComplete="tel"
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!schoolId} // Disable form if no schoolId
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!schoolId}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register/user" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;