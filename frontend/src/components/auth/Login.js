/**
 * Login Component
 *
 * Username/password authentication for students, teachers, and parents.
 *
 * This replaces the old Firebase phone-OTP flow. Students and teachers log
 * in with credentials an admin sets for them (see admin/Users.js). Parents
 * log in with the credentials they set during their one-time OTP activation
 * (see the /otp activation page) - after that, they use this same screen
 * for every subsequent login.
 *
 * @component
 * @author Thuto Dashboard Team
 * @version 3.0.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const Login = () => {
  const [role, setRole] = useState('student'); // 'student' | 'parent' | 'teacher'

  // Pre-fills from email once the user picks one, but stays editable so
  // users without an email address can still set their own username.
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await authService.login(username.trim(), password, role);

      setAuthData(user, token);

      // Normalize role casing for routing
      const normalizedRole = user?.role?.toString().toLowerCase();
      const dashboardPath = normalizedRole === 'parent' ? '/parent/dashboard' : '/dashboard';
      navigate(dashboardPath);
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your username and password.');
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
        width: '100%',
      }}
    >
      <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
          <img
            src={Logo}
            alt="Thuto Dashboard"
            style={{
              height: '80px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            select
            fullWidth
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            margin="normal"
            disabled={loading}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="parent">Parent</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameTouched(true);
            }}
            margin="normal"
            disabled={loading}
            autoComplete="username"
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={loading}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading || !username.trim() || !password}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;