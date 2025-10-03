import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const auth = getAuth();

const SuperAdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
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
      // Handle specific error responses from backend
      if (err.response?.data) {
        const { status, message } = err.response.data;
        
        switch (status) {
          case 401:
            setError('Invalid email or password. Please try again.');
            break;
          case 404:
            setError('Account not found. Please check your email address.');
            break;
          case 500:
            setError('Server error occurred. Please try again later.');
            break;
          default:
            setError(message || 'Login failed. Please try again.');
        }
      } else {
        // Fallback for network errors or unexpected format
        setError(err.message || 'Failed to log in.');
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
        <Typography variant="h4" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Super Admin Login
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
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
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>

          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link to="/superadmin/forgot-password" style={{ textDecoration: 'none', color: '#1976d2', fontSize: '0.875rem' }}>
              Forgot Password?
            </Link>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/superadmins/auth/super/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SuperAdminLogin;
