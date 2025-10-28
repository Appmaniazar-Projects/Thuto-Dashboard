import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert, img } from '@mui/material';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import app from '../../services/firebase';
import Logo from '../../assets/Logo.png';

const auth = getAuth(app);

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
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
      console.log('🔐 Verifying OTP with Firebase...');
      await confirmationResult.confirm(otp);
      console.log('✅ Firebase OTP verification successful');
      
      // Step 2: Login with backend
      console.log('🚀 Logging in with backend...');
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      const { user, token } = await authService.login(cleanPhone);
      
      console.log('✅ Backend login successful:', { user: user?.name, role: user?.role });
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
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        {step === 'phone' ? (
          <Box component="form" onSubmit={handlePhoneSubmit} sx={{ width: '100%' }}>
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
              disabled={loading || phoneNumber.replace(/\s+/g, '').length < 10}
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
    </Container>
  );
};

export default Login;