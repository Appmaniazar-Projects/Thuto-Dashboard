import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button,
  Alert, CircularProgress, Stack,  useTheme, useMediaQuery
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, School as SchoolIcon } from '@mui/icons-material';
import api from '../../services/api';
import Logo from '../../assets/Logo.png';
import TopBar from '../layout/TopBar'; 

const QuickParentRegistration = () => {
  const navigate = useNavigate();

  // ── Irene school state ─────────────────────────────────────────
  const [school, setSchool]           = useState(null);  // { id, name }
  const [loadingSchool, setLoadingSchool] = useState(true);
  const [schoolError, setSchoolError] = useState('');

  // ── Form state ─────────────────────────────────────────────────
  const [form, setForm] = useState({
    firstName:   '',
    lastName:    '',
    phoneNumber: '',
    email:       '',
  });
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess]         = useState(false);

  // ── Fetch Irene school on mount ────────────────────────────────
  useEffect(() => {
    const fetchIrene = async () => {
      try {
        setLoadingSchool(true);
        const response = await api.get('/schools/getIrene');
        const data = response.data;
        if (data?.id && data?.name) {
          setSchool({ id: String(data.id), name: data.name });
        } else {
          setSchoolError('Could not load school details. Please try again later.');
        }
      } catch {
        setSchoolError('Could not load school details. Please try again later.');
      } finally {
        setLoadingSchool(false);
      }
    };
    fetchIrene();
  }, []);

  // ── Form change handler ────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  // ── Validation ─────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.firstName.trim())   e.firstName   = 'First name is required';
    if (!form.lastName.trim())    e.lastName    = 'Last name is required';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    else if (!/^(\+27|0)[0-9]{9}$/.test(form.phoneNumber.replace(/\s/g, '')))
      e.phoneNumber = 'Enter a valid South African number (e.g. 0821234567)';
    if (!form.email.trim())       e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Please enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post('/admin/register-parent/parent', {
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim(),
        phoneNumber:      form.phoneNumber.trim(),
        email:            form.email.trim(),
        schoolId:         school.id,
        status:           'pending_approval',
        registrationDate: new Date().toISOString(),
        role:             'parent',
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (success) {
    return (
      <PageShell>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Registration submitted!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Your registration has been submitted to{' '}
            <strong>{school?.name}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please wait for the school administrator to approve your account
            before attempting to log in. You will be notified once approved.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </Box>
      </PageShell>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <PageShell>
      {/* School banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 3,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.100',
        }}
      >
        <SchoolIcon sx={{ color: 'primary.main', fontSize: 20, flexShrink: 0 }} />
        {loadingSchool ? (
          <CircularProgress size={14} />
        ) : schoolError ? (
          <Typography variant="body2" color="error.main">{schoolError}</Typography>
        ) : (
          <Typography variant="body2" fontWeight={500} color="primary.main">
            {school?.name}
          </Typography>
        )}
      </Box>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
        Parent registration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fill in your details. The school will review and approve your account.
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>

          {/* Name */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={handleChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              fullWidth
              required
              disabled={submitting || loadingSchool}
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={handleChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              fullWidth
              required
              disabled={submitting || loadingSchool}
            />
          </Box>

          {/* Phone */}
          <TextField
            label="Phone number"
            placeholder="e.g. 0821234567"
            value={form.phoneNumber}
            onChange={handleChange('phoneNumber')}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            fullWidth
            required
            disabled={submitting || loadingSchool}
            inputProps={{ inputMode: 'tel' }}
          />

          {/* Email */}
          <TextField
            label="Email address"
            type="email"
            placeholder="e.g. jane@email.com"
            value={form.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email || 'Used for school communication'}
            fullWidth
            required
            disabled={submitting || loadingSchool}
            inputProps={{ inputMode: 'email' }}
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting || loadingSchool || !!schoolError}
            sx={{ mt: 1, py: 1.4, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {submitting
              ? <CircularProgress size={22} color="inherit" />
              : 'Register'
            }
          </Button>

          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/login')}
            disabled={submitting}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Already have an account? Sign in
          </Button>

        </Stack>
      </Box>
    </PageShell>
  );
};

// ── Minimal page shell — logo + centred card ───────────────────
const PageShell = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        isSuperAdmin={true}          // full-width, no sidebar offset
        drawerWidth={0}
        handleDrawerToggle={() => {}}
        title={isMobile ? 'Register' : 'Parent Registration'}
        logoAsImage={true}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
          mt: '64px',           // offset for the fixed AppBar height
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
};

export default QuickParentRegistration;