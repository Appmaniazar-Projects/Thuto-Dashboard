import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  // Clear form errors when user starts typing
  useEffect(() => {
    if (email) setEmailError('');
    if (password) setPasswordError('');
  }, [email, password]);

  const validateForm = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { user, token } = await authService.adminLogin(email, password);
      setAuthData(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Admin login failed:', err);
      
      // Handle specific error messages
      if (err.message.includes('network')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else if (err.message.includes('401') || err.message.toLowerCase().includes('invalid')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('403')) {
        setError('Access denied. You do not have permission to access the admin panel.');
      } else if (err.message.includes('429')) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <img 
            src={Logo} 
            alt="Thuto Dashboard" 
            style={{ 
              height: '80px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </Box>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={loading}
            error={!!emailError}
            helperText={emailError}
            autoFocus
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
            error={!!passwordError}
            helperText={passwordError}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button 
              onClick={() => navigate('/superadmin/forgot-password')} 
              color="primary"
              size="small"
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;