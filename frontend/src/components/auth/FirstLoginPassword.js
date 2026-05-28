import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const useQuery = () => new URLSearchParams(useLocation().search);

const FirstLoginPassword = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');
  const email = query.get('email') || '';

  const [formData, setFormData] = useState({
    email,
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Endpoint can be updated by backend team when ready.
      await authService.setFirstLoginPassword(formData.email, formData.password, token);
      setSuccess('Password created successfully. You can now log in.');
      setTimeout(() => navigate('/superadmin/login'), 1200);
    } catch (err) {
      console.error('First login password setup failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create password. Please try again.');
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
        width: '100%',
        backgroundColor: '#f4f6fb',
        px: 2
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 460 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <img src={Logo} alt="Thuto Dashboard" style={{ height: '80px', width: 'auto' }} />
        </Box>

        <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
          Create Your Password
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Set your initial password to complete your first login. Use at least 8 characters.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            disabled={loading || Boolean(email)}
          />

          <TextField
            required
            fullWidth
            label="New Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />

          <TextField
            required
            fullWidth
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? 'Saving...' : 'Create Password'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have a password?{' '}
              <Link to="/superadmin/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default FirstLoginPassword;
