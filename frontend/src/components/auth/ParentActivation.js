/**
 * Parent Activation Page ( /otp )
 *
 * One-time flow a parent reaches from the link in their approval
 * notification (SMS or email - see Sept 21 meeting notes). Two stages:
 *
 *   1. OTP verification - confirms the parent controls the phone number
 *      on file, via Firebase phone auth (same mechanism the old Login.js
 *      used, just scoped to this one-time flow now instead of every login).
 *   2. Set permanent username/password - stored via a dedicated backend
 *      endpoint (see services/parentActivationService.js), after which
 *      the parent logs in normally from /login going forward.
 *
 * *** Depends on unconfirmed backend contracts - see the prominent note
 * in parentActivationService.js before shipping this. In particular:
 *   - Where the activation token actually arrives (assumed here to be a
 *     `token` query param on this page's URL, e.g. /otp?token=...).
 *   - Whether the phone number needs to be re-entered here at all, or
 *     whether the backend can resolve it from the token alone.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import app from '../../services/firebase';
import parentActivationService from '../../services/parentActivationService';
import Logo from '../../assets/Logo.png';

const auth = getAuth(app);

const ParentActivation = () => {
  const [searchParams] = useSearchParams();
  const activationToken = searchParams.get('token') || '';

  const [step, setStep] = useState('phone'); // 'phone' -> 'otp' -> 'credentials' -> 'done'

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [firebaseToken, setFirebaseToken] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!activationToken) {
      setError('This activation link is missing its token. Please use the link from your approval notification.');
    }
  }, [activationToken]);

  // Initialize reCAPTCHA (same pattern as the old Login.js phone-OTP flow)
  useEffect(() => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    } catch (err) {
      console.error('Error initializing recaptcha:', err);
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

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

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!activationToken) return;

    setLoading(true);
    setError('');
    try {
      const phoneNumberForFirebase = `+27${phoneNumber.replace(/\s+/g, '').slice(1)}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumberForFirebase, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('Session expired. Please request a new code.');
      setStep('phone');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const credential = await confirmationResult.confirm(otp);
      const idToken = await credential.user.getIdToken();
      setFirebaseToken(idToken);
      setStep('credentials');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError('Invalid code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please choose a username and password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await parentActivationService.activateParent({
        token: activationToken,
        firebaseToken,
        username: username.trim(),
        password,
      });
      setStep('done');
    } catch (err) {
      console.error('Activation failed:', err);
      setError(err.response?.data?.message || err.message || 'Could not set your credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400 }}>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
          <img src={Logo} alt="Thuto Dashboard" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
        </Box>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        {step === 'phone' && (
          <Box component="form" onSubmit={handlePhoneSubmit} sx={{ width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Confirm the phone number on your account to verify it's you.
            </Typography>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              placeholder="076 123 4567"
              margin="normal"
              disabled={loading || !activationToken}
              inputProps={{ inputMode: 'tel', pattern: '[0-9\\s]*', maxLength: 12 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading || !activationToken || phoneNumber.replace(/\s+/g, '').length < 10}
            >
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
          </Box>
        )}

        {step === 'otp' && (
          <Box component="form" onSubmit={handleOtpSubmit} sx={{ width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>Enter the code sent to {phoneNumber}</Typography>
            <TextField
              fullWidth
              label="Verification Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              margin="normal"
              disabled={loading}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button fullWidth variant="outlined" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} disabled={loading}>
                Back
              </Button>
              <Button type="submit" fullWidth variant="contained" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </Box>
          </Box>
        )}

        {step === 'credentials' && (
          <Box component="form" onSubmit={handleCredentialsSubmit} sx={{ width: '100%' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Verified! Choose a username and password for logging in from now on.
            </Typography>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              disabled={loading}
              helperText="Usually your email address, but you can pick anything"
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((p) => !p)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              disabled={loading}
              error={!!confirmPassword && confirmPassword !== password}
              helperText={confirmPassword && confirmPassword !== password ? 'Passwords do not match' : ''}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading || !username.trim() || !password || password !== confirmPassword}
            >
              {loading ? 'Saving...' : 'Set Credentials'}
            </Button>
          </Box>
        )}

        {step === 'done' && (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your account is ready. Log in with your new username and password.
            </Typography>
            <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Box>
        )}

        <div id="recaptcha-container" style={{ display: 'none' }} />
      </Paper>
    </Box>
  );
};

export default ParentActivation;