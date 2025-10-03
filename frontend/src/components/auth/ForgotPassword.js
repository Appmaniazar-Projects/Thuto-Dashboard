import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess('If an account with that email exists, you will receive a password reset link shortly.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset email. Please try again.');
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
        <Typography variant="h4" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Forgot Password
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%', mb: 2 }}>{success}</Alert>}

        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={loading || !!success}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !!success}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Remember your password?{' '}
              <Link to="/superadmin/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Back to Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
