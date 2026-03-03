import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const SuperAdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate    = useNavigate();
  const { setAuthData } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await authService.superAdminLogin(formData.email, formData.password);
      setAuthData(user, token);
      navigate('/superadmin/dashboard');
    } catch (err) {
      // HTTP status lives on err.response.status, not inside the response body
      const httpStatus = err.response?.status;
      const bodyMessage = err.response?.data?.message;

      switch (httpStatus) {
        case 401:
          setError('Invalid email or password. Please try again.');
          break;
        case 403:
          setError('Access denied. You do not have super admin permissions.');
          break;
        case 404:
          setError('Account not found. Please check your email address.');
          break;
        case 500:
          setError('Server error. Please try again later or contact support.');
          break;
        default:
          // Use backend message if available, otherwise fall back to a generic message
          setError(bodyMessage || err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 400
        }}
      >
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
          <img
            src={Logo}
            alt="Thuto Logo"
            style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
          />
        </Box>

        <Typography variant="h4" align="center" color="text.secondary" sx={{ mb: 1.5 }}>
          Super Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />

          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>

          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link
              to="/superadmin/forgot-password"
              style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link
                to="/superadmin/register"
                style={{ textDecoration: 'none', color: '#1976d2' }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SuperAdminLogin;