import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert, Link as MuiLink } from '@mui/material';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/superadmin/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
          <Typography variant="h5" align="center" color="error" sx={{ mb: 3 }}>
            Invalid or missing reset token
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={MuiLink} 
            to="/superadmin/forgot-password"
            fullWidth
            sx={{ mt: 2 }}
          >
            Request New Reset Link
          </Button>
        </Paper>
      </Container>
    );
  }

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
        <Typography variant="h4" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Reset Your Password
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%', mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || !!success}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || !!success}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !!success}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <MuiLink component={Link} to="/superadmin/login" variant="body2">
              Back to Login
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;