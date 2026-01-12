/**
 * Login Component
 * 
 * This component handles the authentication flow for students, teachers, and parents
 * using Firebase phone number authentication with OTP verification. It provides a
 * two-step login process: phone number entry and OTP verification.
 * 
 * Authentication Flow:
 * 1. User enters phone number
 * 2. Firebase sends OTP via SMS
 * 3. User enters OTP code
 * 4. Firebase verifies OTP
 * 5. Backend validates user and returns JWT token
 * 6. User is redirected to appropriate dashboard
 * 
 * Features:
 * - Phone number validation and formatting
 * - Firebase reCAPTCHA integration
 * - OTP verification with resend functionality
 * - Automatic role-based navigation
 * - Comprehensive error handling
 * 
 * @component
 * @author Thuto Dashboard Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, TextField, Button, Box, Alert, MenuItem } from '@mui/material';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import app from '../../services/firebase';
import Logo from '../../assets/Logo.png';

const auth = getAuth(app);

/**
 * Main Login functional component
 * Handles the complete authentication flow for phone-based login
 */
const Login = () => {
  // Form state for phone number input (formatted as XXX XXX XXXX)
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // OTP code entered by user (6 digits)
  const [otp, setOtp] = useState('');
  
  // Current step in authentication flow ('phone' or 'otp')
  const [step, setStep] = useState('phone');

  const [role, setRole] = useState('student');   // 'student' | 'parent' | 'teacher'
  const [username, setUsername] = useState('');  // only used for students
  
  // Loading state for API calls and Firebase operations
  const [loading, setLoading] = useState(false);
  
  // Error message display state
  const [error, setError] = useState('');
  
  // Firebase confirmation result from phone authentication
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  // Navigation hook for redirecting after successful login
  const navigate = useNavigate();
  
  // Authentication context for setting user data and tokens
  const { setAuthData } = useAuth();

  // Format phone: 076 123 4567
  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');
    let formatted = cleaned.substring(0, 3);
    if (cleaned.length > 3) {
      formatted += ' ' + cleaned.substring(3, 6);
      if (cleaned.length > 6) {
        formatted += ' ' + cleaned.substring(6, 10);
      }
    }
    return formatted;
  };

  // Initialize reCAPTCHA
  useEffect(() => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired
        }
      });
    } catch (error) {
      console.error('Error initializing recaptcha:', error);
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    // Check rate limiting - Firebase allows 1 SMS per minute per phone number
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const lastOtpTime = localStorage.getItem(`lastOtp_${cleanPhone}`);
    if (lastOtpTime) {
      const timeDiff = Date.now() - parseInt(lastOtpTime);
      const waitTime = 60000; // 1 minute
      if (timeDiff < waitTime) {
        const remainingTime = Math.ceil((waitTime - timeDiff) / 1000);
        setError(`Please wait ${remainingTime} seconds before requesting another OTP`);
        return;
      }
    }
    
    setLoading(true);
    setError('');

    try {
      const phoneNumberForFirebase = `+27${phoneNumber.replace(/\s+/g, '').slice(1)}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumberForFirebase, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('Session expired. Please try again.');
      setStep('phone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Verify OTP with Firebase
      await confirmationResult.confirm(otp);
      
      // Step 2: Login with backend
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      const usernameToSend = role === 'student' ? username.trim() : undefined;
      const { user, token } = await authService.login(cleanPhone, role, usernameToSend);
      
      setAuthData(user, token);
      
      // Navigate based on user role
      const dashboardPath = user?.role === 'PARENT' ? '/parent/dashboard' : '/dashboard';
      navigate(dashboardPath);
    } catch (err) {
      console.error('❌ Login process failed:', err);
      
      // Check if it's a Firebase OTP error or backend login error
      if (err.code && err.code.includes('auth/')) {
        // Firebase OTP verification error
        setError('Invalid OTP code. Please check and try again.');
      } else {
        // Backend login error - show the specific error message
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
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
              objectFit: 'contain'
            }} 
          />
        </Box>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        {step === 'phone' ? (
            <Box component="form" onSubmit={handlePhoneSubmit} sx={{ width: '100%' }}>
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

            {/* NEW: Username for students only */}
            {role === 'student' && (
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                disabled={loading}
                helperText="Enter the student's username (e.g. name and surname)."
              />
            )}

            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              placeholder="076 123 4567"
              margin="normal"
              disabled={loading}
              inputProps={{ inputMode: 'tel', pattern: '[0-9\\s]*', maxLength: 12 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={
                loading ||
                phoneNumber.replace(/\s+/g, '').length < 10 ||
                (role === 'student' && !username.trim())
              }
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleOtpSubmit} sx={{ width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>Enter the OTP sent to {phoneNumber}</Typography>
            <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              margin="normal"
              disabled={loading}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button fullWidth variant="outlined" onClick={handleBackToPhone} disabled={loading}>
                Back
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </Box>
          </Box>
        )}
        <div id="recaptcha-container" style={{ display: 'none' }} />
      </Paper>
    </Box>
  );
};

export default Login;