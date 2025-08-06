import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, Container,
  Alert, FormControl, InputLabel, MenuItem, Select
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import api from '../../services/api';
import { APP_TEXT } from '../../utils/appText';

const Login = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    role: 'TEACHER',
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useTestMode, setUseTestMode] = useState(true); // Toggle for test mode
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const auth = getAuth();

  // Hardcoded credentials for testing
  const TEST_CREDENTIALS = {
    ADMIN: { phone: '0820000001', otp: '123456' },
    TEACHER: { phone: '0820000002', otp: '123456' },
    PARENT: { phone: '0820000003', otp: '123456' },
    STUDENT: { phone: '0820000004', otp: '123456' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const setupRecaptcha = () => {
    // Clear existing verifier first
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.');
        setLoading(false);
      }
    });
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    
    if (!formData.phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      // TEST MODE: Skip Firebase and go directly to OTP verification
      if (useTestMode) {
        const testCred = TEST_CREDENTIALS[formData.role];
        if (formData.phoneNumber === testCred.phone) {
          setOtpSent(true);
          setLoading(false);
          return;
        } else {
          setError(`Test mode: Use ${testCred.phone} for ${formData.role} role`);
          setLoading(false);
          return;
        }
      }

      // PRODUCTION MODE: Use Firebase
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      
      // Better phone number formatting
      let phone = formData.phoneNumber.replace(/\s+/g, ''); // Remove spaces
      if (!phone.startsWith('+')) {
        // Remove leading 0 if present for SA numbers
        if (phone.startsWith('0')) {
          phone = phone.substring(1);
        }
        phone = `+27${phone}`;
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
    } catch (err) {
      console.error('OTP Send Error:', err);
      let errorMessage = 'Failed to send OTP. ';
      
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage += 'Please check your phone number format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage += 'Too many requests. Please try again later.';
      } else {
        errorMessage += 'Please check your phone number and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      let idToken = null;
      let user = null;

      // TEST MODE: Validate hardcoded credentials
      if (useTestMode) {
        const testCred = TEST_CREDENTIALS[formData.role];
        if (formData.phoneNumber === testCred.phone && formData.otp === testCred.otp) {
          // Create mock user for test mode
          user = {
            uid: `test-${formData.role.toLowerCase()}-${Date.now()}`,
            phoneNumber: formData.phoneNumber,
            email: `${formData.role.toLowerCase()}@test.com`,
            emailVerified: true
          };
          idToken = `test-token-${formData.role.toLowerCase()}-${Date.now()}`;
        } else {
          setError(`Test mode: Use OTP ${testCred.otp} for ${formData.role} role`);
          setLoading(false);
          return;
        }
      } else {
        // PRODUCTION MODE: Verify with Firebase
        const result = await window.confirmationResult.confirm(formData.otp);
        user = result.user;
        idToken = await user.getIdToken();
      }

      // Create user data based on role
      const mockBackendResponse = createMockUserData(formData.role, user);
      const userData = mockBackendResponse.user;
      const token = mockBackendResponse.token;

      // Store user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Mock userData:', userData);
      
      // Update auth context
      setUser(userData);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('OTP Verification Error:', err);
      let errorMessage = 'Invalid OTP. ';
      
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage += 'Please check the code and try again.';
      } else if (err.code === 'auth/code-expired') {
        errorMessage += 'The code has expired. Please request a new one.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mock user data creator (replace with actual backend response)
  const createMockUserData = (role, firebaseUser) => {
    const baseUser = {
      id: firebaseUser.uid,
      phoneNumber: firebaseUser.phoneNumber || formData.phoneNumber,
      role: role.toLowerCase(),
    };

    switch (role) {
      case 'ADMIN':
        return {
          user: {
            ...baseUser,
            name: 'System',
            surname: 'Administrator',
            email: 'admin@thuto.com',
            permissions: ['all']
          },
          token: `admin-jwt-${Date.now()}`
        };
      case 'TEACHER':
        return {
          user: {
            ...baseUser,
            name: 'Sarah',
            surname: 'Johnson',
            email: 'sarah.johnson@thuto.com',
            department: 'Mathematics',
            subjects: ['Mathematics', 'Physical Science'],
            grades: ['Grade 10', 'Grade 11']
          },
          token: `teacher-jwt-${Date.now()}`
        };
      case 'PARENT':
        return {
          user: {
            ...baseUser,
            name: 'Michael',
            surname: 'Smith',
            email: 'michael.smith@gmail.com',
            children: ['student-id-1', 'student-id-2']
          },
          token: `parent-jwt-${Date.now()}`
        };
      case 'STUDENT':
        return {
          user: {
            ...baseUser,
            name: 'Emma',
            surname: 'Davis',
            email: 'emma.davis@gmail.com',
            grade: 'Grade 10',
            studentId: 'CS2024001'
          },
          token: `student-jwt-${Date.now()}`
        };
      default:
        return {
          user: baseUser,
          token: `user-jwt-${Date.now()}`
        };
    }
  };
  

  const goBack = () => {
    setOtpSent(false);
    setFormData(prev => ({ ...prev, otp: '' }));
    setError('');
  };

  const fillTestCredentials = (role) => {
    const creds = TEST_CREDENTIALS[role];
    setFormData(prev => ({
      ...prev,
      phoneNumber: creds.phone,
      role: role
    }));
    setError('');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Thuto Portal
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 3 }}>
          {otpSent ? 'Enter Verification Code' : 'Sign In'}
        </Typography>

        {/* Test Mode Toggle */}
        <Box sx={{ mb: 2, p: 1, bgcolor: useTestMode ? 'primary.light' : 'grey.200', borderRadius: 1 }}>
          <Typography variant="caption" display="block" align="center">
            <Button 
              size="small" 
              variant={useTestMode ? "contained" : "outlined"}
              onClick={() => setUseTestMode(!useTestMode)}
              sx={{ mr: 1 }}
            >
              {useTestMode ? 'Test Mode ON' : 'Test Mode OFF'}
            </Button>
            {useTestMode ? 'Using hardcoded credentials' : 'Using Firebase OTP'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={otpSent ? verifyOtp : sendOtp} sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            margin="normal"
            autoComplete="tel"
            disabled={otpSent || loading}
            helperText={otpSent ? undefined : (useTestMode ? "Use test numbers below" : "Enter your phone number (e.g., 0821234567)")}
          />

          {otpSent && (
            <TextField
              required
              fullWidth
              label="OTP"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              helperText={useTestMode ? "Use 123456 for all test accounts" : "Enter the 6-digit code sent to your phone"}
              autoFocus
            />
          )}

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="role-label">Sign in as</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              label="Sign in as"
              onChange={handleChange}
              disabled={otpSent || loading}
            >
              <MenuItem value="ADMIN">Administrator</MenuItem>
              <MenuItem value="TEACHER">Teacher</MenuItem>
              <MenuItem value="PARENT">Parent</MenuItem>
              <MenuItem value="STUDENT">Student</MenuItem>
            </Select>
          </FormControl>

          {/* Hidden div for reCAPTCHA */}
          <div id="recaptcha-container"></div>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (otpSent ? 'Verifying...' : 'Sending...') : (otpSent ? 'Verify OTP & Sign In' : 'Send OTP')}
          </Button>

          {otpSent && (
            <Button
              fullWidth
              variant="outlined"
              onClick={goBack}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Back
            </Button>
          )}

          {/* Test Credentials - Only show in test mode */}
          {useTestMode && !otpSent && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                <strong>Test Credentials (Click to fill):</strong>
              </Typography>
              {Object.entries(TEST_CREDENTIALS).map(([role, creds]) => (
                <Button
                  key={role}
                  size="small"
                  variant="outlined"
                  onClick={() => fillTestCredentials(role)}
                  sx={{ m: 0.5, fontSize: '0.7rem' }}
                >
                  {role}: {creds.phone}
                </Button>
              ))}
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                OTP for all test accounts: <strong>123456</strong>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;