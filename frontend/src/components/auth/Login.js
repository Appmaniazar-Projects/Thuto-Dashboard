import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  // Format phone: 076 123 4567
  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');
    let formatted = cleaned.substring(0, 3);
    if (cleaned.length > 3) {
      formatted += ' ' + cleaned.substring(3, 6);
      if (cleaned.length > 6) formatted += ' ' + cleaned.substring(6, 10);
    }
    return formatted;
  };

  // Initialize reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier && auth) {
      if (process.env.NODE_ENV === 'development') {
        auth.appVerificationDisabledForTesting = true; // ✅ avoid reCAPTCHA in dev
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        { size: 'invisible' },
        auth
      );
    }
  }, []);

  // Handle resend timer
  useEffect(() => {
    if (step === 'otp') {
      setCanResend(false);
      const timer = setTimeout(() => setCanResend(true), 60000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Send OTP
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const firebasePhone = `+27${phoneNumber.replace(/\s+/g, '').slice(1)}`;
      const confirmation = await signInWithPhoneNumber(auth, firebasePhone, window.recaptchaVerifier);
      window.confirmationResult = confirmation; // keep globally
      setStep('otp');
      console.log('📱 OTP sent to', firebasePhone);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const confirmation = window.confirmationResult;

    if (!confirmation) {
      setError('Session expired. Please request a new OTP.');
      setStep('phone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const firebaseUser = await confirmation.confirm(otp);
      const cleanPhone = phoneNumber.replace(/\s+/g, '');
      const firebaseToken = await firebaseUser.user.getIdToken();

      // Login to backend
      const response = await authService.login(cleanPhone, firebaseToken);

      if (!response || !response.user || !response.token) throw new Error('Invalid server response');

      const normalizedUser = setAuthData(response.user, response.token);
      const dashboardMap = {
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
        parent: '/parent/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(dashboardMap[normalizedUser.role?.toLowerCase()] || '/dashboard', { replace: true });
    } catch (err) {
      console.error('❌ Login failed:', err);
      if (err.code?.includes('auth/invalid-verification-code')) {
        setError('Invalid OTP. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <img src={Logo} alt="Thuto Dashboard" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
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
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading || phoneNumber.replace(/\s+/g, '').length < 10}>
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
              <Button fullWidth variant="outlined" onClick={() => setStep('phone')} disabled={loading}>Back</Button>
              <Button type="submit" fullWidth variant="contained" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </Box>
            {canResend && (
              <Button onClick={handlePhoneSubmit} sx={{ mt: 2 }} disabled={loading}>
                Resend OTP
              </Button>
            )}
          </Box>
        )}

        <div id="recaptcha-container" style={{ display: 'none' }} />
      </Paper>
    </Container>
  );
};

export default Login;
