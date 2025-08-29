import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button,
  Box, Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, token } = await authService.adminLogin(email, password);
      setAuthData(user, token);
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" align="center" sx={{ mb: 3 }}>
          Admin Login
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={loading}
          />

          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;