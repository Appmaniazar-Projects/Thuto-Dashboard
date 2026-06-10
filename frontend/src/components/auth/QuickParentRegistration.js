import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button,
  Alert, CircularProgress, Stack, List, ListItem,
  ListItemButton, ListItemText
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, School as SchoolIcon } from '@mui/icons-material';
import api from '../../services/api';
import Logo from '../../assets/Logo.png';

/**
 * Generic minimal parent registration page.
 * School resolved from:
 *   1. URL param  — /register/:schoolSlug
 *   2. Query param — /register?schoolId=42
 *   3. Manual search by the user
 *
 * Submits to: POST /admin/register-parent/parent  (public endpoint)
 */
const QuickParentRegistration = () => {
  const navigate = useNavigate();
  const { schoolSlug } = useParams();
  const [searchParams] = useSearchParams();
  const querySchoolId = searchParams.get('schoolId');

  // ── School state ───────────────────────────────────────────────
  const [allSchools, setAllSchools]             = useState([]);
  const [loadingSchools, setLoadingSchools]     = useState(false);
  const [schoolSearchInput, setSchoolSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [selectedSchool, setSelectedSchool]     = useState(null); // { id, name }

  // ── Form state ─────────────────────────────────────────────────
  const [form, setForm]           = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess]     = useState(false);

  // ── Load all public schools ────────────────────────────────────
  useEffect(() => {
    const fetchSchools = async () => {
      setLoadingSchools(true);
      try {
        const response = await api.get('/schools/public');
        setAllSchools(Array.isArray(response.data) ? response.data : []);
      } catch {
        setAllSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  // ── Pre-select school from URL if provided ─────────────────────
  useEffect(() => {
    if ((!querySchoolId && !schoolSlug) || allSchools.length === 0) return;
    const idOrSlug = querySchoolId || schoolSlug;
    const match = allSchools.find(
      s =>
        String(s.id) === String(idOrSlug) ||
        s.slug === idOrSlug ||
        s.name?.toLowerCase().replace(/\s+/g, '-') === idOrSlug?.toLowerCase()
    );
    if (match) {
      setSelectedSchool({ id: String(match.id), name: match.name });
      setSchoolSearchInput(match.name);
    }
  }, [allSchools, querySchoolId, schoolSlug]);

  // ── School search filtering ────────────────────────────────────
  const filteredSchools = schoolSearchInput.trim().length > 1
    ? allSchools.filter(s =>
        s.name?.toLowerCase().includes(schoolSearchInput.toLowerCase()) ||
        s.province?.toLowerCase().includes(schoolSearchInput.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSchoolSearchChange = (e) => {
    setSchoolSearchInput(e.target.value);
    setSelectedSchool(null);
    setShowSuggestions(true);
    setErrors(er => ({ ...er, school: '' }));
  };

  const handleSchoolSelect = useCallback((school) => {
    setSelectedSchool({ id: String(school.id), name: school.name });
    setSchoolSearchInput(school.name);
    setShowSuggestions(false);
    setErrors(er => ({ ...er, school: '' }));
  }, []);

  // ── Form handlers ──────────────────────────────────────────────
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
    if (!selectedSchool?.id) e.school = 'Please select a school from the list';
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
      const parentData = {
        firstName:        form.firstName.trim(),
        lastName:         form.lastName.trim(),
        phoneNumber:      form.phoneNumber.trim(),
        schoolId:         selectedSchool.id,
        status:           'pending_approval',
        registrationDate: new Date().toISOString(),
        role:             'parent',
      };
      await api.post('/admin/register-parent/parent', parentData);
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your details have been sent to <strong>{selectedSchool?.name}</strong> for approval.
            You will be contacted once your account is activated.
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

          {/* School search */}
          <Box sx={{ position: 'relative' }}>
            <TextField
              label="School"
              placeholder={loadingSchools ? 'Loading schools…' : 'Type to search your school…'}
              value={schoolSearchInput}
              onChange={handleSchoolSearchChange}
              onFocus={() => schoolSearchInput.trim().length > 1 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
              fullWidth
              required
              disabled={submitting}
              error={!!errors.school}
              helperText={
                errors.school ||
                (selectedSchool
                  ? `✓ ${selectedSchool.name}`
                  : 'Search by school name or province')
              }
              InputProps={{
                startAdornment: (
                  <SchoolIcon sx={{ fontSize: 18, color: 'text.disabled', mr: 1 }} />
                ),
              }}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSchools.length > 0 && (
              <Paper
                elevation={4}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  maxHeight: 240,
                  overflowY: 'auto',
                  mt: 0.5,
                  borderRadius: 2,
                }}
              >
                <List dense disablePadding>
                  {filteredSchools.map((school) => (
                    <ListItem key={school.id} disablePadding>
                      <ListItemButton onMouseDown={() => handleSchoolSelect(school)}>
                        <ListItemText
                          primary={school.name}
                          secondary={school.province}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* No results */}
            {showSuggestions && schoolSearchInput.trim().length > 1 && filteredSchools.length === 0 && !loadingSchools && (
              <Paper
                elevation={2}
                sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, mt: 0.5, p: 2, borderRadius: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  No schools found for "{schoolSearchInput}"
                </Typography>
              </Paper>
            )}
          </Box>

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
            disabled={submitting}
            inputProps={{ inputMode: 'tel' }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting || !selectedSchool}
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

// ── Minimal page shell ─────────────────────────────────────────
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
);

export default QuickParentRegistration;