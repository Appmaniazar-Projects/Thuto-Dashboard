import React, { useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button,
  Box, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // <-- Add this
import api from '../../services/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

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
      const auth = getAuth();
      // Use email as username for Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.username, // This should be the admin email
        formData.password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Optionally, send idToken to your backend to get a JWT and user info
      // const res = await api.post('/auth/admin-login', { idToken });
      // const { user: backendUser, token } = res.data;
      // login(backendUser, token);

      // For now, just log in with Firebase user info
      // login(
      //   {
      //     id: user.uid,
      //     username: user.email,
      //     role: 'admin',
      //     name: 'Admin',
      //     surname: '',
      //   },
      //   idToken
      // );
      setUser({
        id: user.uid,
        email: user.email,
        role: 'admin',
        name: 'Admin',
        surname: '',
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Firebase login error:', err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          Admin Login
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            required
            fullWidth
            label="Email"
            name="username"
            value={formData.username}
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
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;