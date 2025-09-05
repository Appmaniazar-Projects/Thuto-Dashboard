import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';

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
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
    }, auth);

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
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
      await confirmationResult.confirm(otp);
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      const { user, token } = await authService.login(cleanPhone);
      setAuthData(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError('Invalid OTP. Please try again.');
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
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>Login</Typography>
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