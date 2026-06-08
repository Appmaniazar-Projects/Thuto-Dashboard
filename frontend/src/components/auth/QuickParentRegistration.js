import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button,
  Alert, CircularProgress, Stack
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, School as SchoolIcon } from '@mui/icons-material';
import parentService from '../../services/parentService';
import Logo from '../../assets/Logo.png';


const QuickParentRegistration = () => {
  const navigate = useNavigate();
  const { schoolSlug } = useParams();                // /register/:schoolSlug
  const [searchParams] = useSearchParams();
  const querySchoolId = searchParams.get('schoolId');

  const [schoolId, setSchoolId]   = useState(querySchoolId || schoolSlug || '');
  const [schoolName, setSchoolName] = useState('');
  const [loadingSchool, setLoadingSchool] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── resolve school name from ID/slug ──────────────────────────
  useEffect(() => {
    const resolve = async () => {
      if (!schoolId) return;
      setLoadingSchool(true);
      try {
        const schools = await parentService.getPublicSchools();
        const match = (schools || []).find(
          s =>
            String(s.id) === String(schoolId) ||
            s.slug === schoolId ||
            s.name?.toLowerCase().replace(/\s+/g, '-') === schoolId.toLowerCase()
        );
        if (match) {
          setSchoolName(match.name);
          setSchoolId(String(match.id)); // normalise to numeric id
        } else {
          setSchoolName('');
        }
      } catch {
        // silently fall through — school name is display-only
      } finally {
        setLoadingSchool(false);
      }
    };
    resolve();
  }, [schoolSlug, querySchoolId]);

  // ── validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName  = 'First name is required';
    if (!form.lastName.trim())   e.lastName   = 'Last name is required';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    else if (!/^(\+27|0)[0-9]{9}$/.test(form.phoneNumber.replace(/\s/g, '')))
      e.phoneNumber = 'Enter a valid South African number (e.g. 0821234567)';
    if (!schoolId) e.school = 'No school linked to this registration link.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim(),
        phoneNumber:      form.phoneNumber.trim(),
        schoolId,
        status:           'pending_approval',
        registrationDate: new Date().toISOString(),
        role:             'parent',
      };
      await parentService.registerParent(payload);
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

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  // ── success screen ────────────────────────────────────────────
  if (success) {
    return (
      <PageShell>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Registration submitted!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your details have been sent to the school for approval.
            You will be contacted once your account is activated.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </Box>
      </PageShell>
    );
  }

  // ── form ──────────────────────────────────────────────────────
  return (
    <PageShell>
      {/* School banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.100',
          minHeight: 40,
        }}
      >
        <SchoolIcon sx={{ color: 'primary.main', fontSize: 20, flexShrink: 0 }} />
        {loadingSchool ? (
          <CircularProgress size={14} />
        ) : schoolName ? (
          <Typography variant="body2" fontWeight={500} color="primary.main">
            {schoolName}
          </Typography>
        ) : schoolId ? (
          <Typography variant="body2" color="text.secondary">
            School ID: {schoolId}
          </Typography>
        ) : (
          <Typography variant="body2" color="error.main">
            No school linked — check your registration link.
          </Typography>
        )}
      </Box>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
        Parent registration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fill in your details. The school will review and approve your account.
      </Typography>

      {errors.school && (
        <Alert severity="error" sx={{ mb: 2 }}>{errors.school}</Alert>
      )}
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={handleChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              fullWidth
              required
              disabled={submitting}
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={handleChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              fullWidth
              required
              disabled={submitting}
            />
          </Box>

          <TextField
            label="Phone number"
            placeholder="e.g. 0821234567"
            value={form.phoneNumber}
            onChange={handleChange('phoneNumber')}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            fullWidth
            required
            disabled={submitting}
            inputProps={{ inputMode: 'tel' }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting || !schoolId}
            sx={{ mt: 1, py: 1.4, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Register'}
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

// ── minimal page shell — logo + centred card ───────────────────
const PageShell = ({ children }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#F7F8FA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 4,
    }}
  >
    <Box sx={{ mb: 3, textAlign: 'center' }}>
      <Box
        component="img"
        src={Logo}
        alt="Thuto"
        sx={{ height: 44, width: 'auto', objectFit: 'contain' }}
      />
    </Box>
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 420,
        p: { xs: 3, sm: 4 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {children}
    </Paper>
  </Box>
);

export default QuickParentRegistration;