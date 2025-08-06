// RegisterUser.js (for Parent and Student roles)

import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, Container,
  MenuItem, Select, InputLabel, FormControl, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    name: '',
    surname: '',
    role: '',
    gender: '',
    title: '',
    grade: '',
    mother: '',
    father: '',
    guardian: '',
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const auth = getAuth();

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.');
        setLoading(false);
      }
    });
  };

  const validateUserInfo = () => {
    const requiredFields = ['name', 'surname', 'role', 'gender', 'title'];
    if (formData.role === 'student') {
      requiredFields.push('grade');
    }
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    if (missingFields.length > 0) {
      setError('Please complete all required fields');
      return false;
    }
    return true;
  };

  const proceedToPhoneVerification = () => {
    setError('');
    if (validateUserInfo()) setStep(2);
  };

  const sendOtp = async () => {
    if (!formData.phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      let phone = formData.phoneNumber.replace(/\s+/g, '');
      if (!phone.startsWith('+')) {
        if (phone.startsWith('0')) phone = phone.substring(1);
        phone = `+27${phone}`;
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep(3);
    } catch (err) {
      setError('Failed to send OTP. Please check your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (!formData.otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(formData.otp);
      const user = result.user;
      const idToken = await user.getIdToken();
      const payload = {
        idToken,
        role: formData.role,
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        title: formData.title,
        gender: formData.gender,
        ...(formData.role === 'student' && { grade: formData.grade }),
        ...(formData.role === 'parent' && {
          mother: formData.mother?.trim() || '',
          father: formData.father?.trim() || '',
          guardian: formData.guardian?.trim() || '',
        })
      };
      await api.post('/auth/register', payload);
      const loginRes = await api.post('/auth/login', { idToken });
      const { user: userData, token } = loginRes.data;
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          Register - Step {step} of 3
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {step === 1 && (
          <Box sx={{ mt: 2 }}>
            <TextField fullWidth required label="Name" name="name" value={formData.name} onChange={handleChange} margin="normal" disabled={loading} />
            <TextField fullWidth required label="Surname" name="surname" value={formData.surname} onChange={handleChange} margin="normal" disabled={loading} />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Title</InputLabel>
              <Select name="title" value={formData.title} onChange={handleChange} disabled={loading}>
                <MenuItem value="Mr.">Mr.</MenuItem>
                <MenuItem value="Ms.">Ms.</MenuItem>
                <MenuItem value="Mrs.">Mrs.</MenuItem>
                <MenuItem value="Dr.">Dr.</MenuItem>
                <MenuItem value="Miss">Miss</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={formData.gender} onChange={handleChange} disabled={loading}>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role} onChange={handleChange} disabled={loading}>
                <MenuItem value="parent">Parent</MenuItem>
                <MenuItem value="student">Student</MenuItem>
              </Select>
            </FormControl>

            {formData.role === 'student' && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Grade</InputLabel>
                <Select name="grade" value={formData.grade} onChange={handleChange} disabled={loading}>
                  <MenuItem value="Grade 8">Grade 8</MenuItem>
                  <MenuItem value="Grade 9">Grade 9</MenuItem>
                  <MenuItem value="Grade 10">Grade 10</MenuItem>
                  <MenuItem value="Grade 11">Grade 11</MenuItem>
                  <MenuItem value="Grade 12">Grade 12</MenuItem>
                </Select>
              </FormControl>
            )}

            {formData.role === 'parent' && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Family Information (Optional):
                </Typography>
                <TextField fullWidth label="Mother's Name" name="mother" value={formData.mother} onChange={handleChange} margin="normal" disabled={loading} />
                <TextField fullWidth label="Father's Name" name="father" value={formData.father} onChange={handleChange} margin="normal" disabled={loading} />
                <TextField fullWidth label="Guardian's Name" name="guardian" value={formData.guardian} onChange={handleChange} margin="normal" disabled={loading} />
              </>
            )}

            <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={proceedToPhoneVerification} disabled={loading}>
              Continue to Phone Verification
            </Button>
             <Button
                fullWidth
                variant="text"
                sx={{ mt: 2 }}
                onClick={() => navigate('/login')}
                >
                Already have an account? Login
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please enter your phone number to verify your account.
            </Typography>
            <TextField required fullWidth label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} margin="normal" autoComplete="tel" helperText="e.g. 0821234567 or +27821234567" disabled={loading} />
            <div id="recaptcha-container"></div>
            <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={goBack} disabled={loading}>Back</Button>
          </Box>
        )}

        {step === 3 && (
          <Box component="form" onSubmit={verifyOtpAndRegister} sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter the OTP sent to your phone.
            </Typography>
            <TextField required fullWidth label="OTP" name="otp" value={formData.otp} onChange={handleChange} margin="normal" helperText="6-digit code" disabled={loading} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Completing Registration...' : 'Complete Registration'}
            </Button>
            <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={goBack} disabled={loading}>Back</Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default RegisterUser;