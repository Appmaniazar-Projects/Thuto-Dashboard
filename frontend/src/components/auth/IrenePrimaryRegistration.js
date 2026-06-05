import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import parentService from '../../services/parentService';

// ─────────────────────────────────────────────────────────────────────────────
// IrenePrimaryRegistration
//
// Minimal onboarding form collecting only name, surname and phone number.
// Designed for POPIA compliance when dealing with information linked to minors.
// The school will follow up to link the parent to their child using the
// information provided here — no further personal data is collected upfront.
// ─────────────────────────────────────────────────────────────────────────────

const IRENE_PRIMARY_SCHOOL_ID = 'irene-primary'; // Replace with actual school ID from DB

const IrenePrimaryRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Please enter your last name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!/^(\+27|0)[0-9]{9}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid South African phone number (e.g. 0123456789)');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setError('');

      await parentService.registerParent({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        schoolId: IRENE_PRIMARY_SCHOOL_ID,
        status: 'pending_approval',
        registrationDate: new Date().toISOString(),
        // Minimal registration flag so the school knows to follow up
        registrationType: 'minimal_irene_primary'
      });

      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Thank you, {formData.firstName}!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your details have been received. A representative from Irene Primary
              will be in touch to complete the process and link you to your child's
              profile.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you have any questions in the meantime, please contact the school
              directly.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 4 }}
              onClick={() => window.location.href = '/login'}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Irene Primary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Parent registration
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="First Name"
              fullWidth
              required
              value={formData.firstName}
              onChange={handleChange('firstName')}
              disabled={loading}
              autoComplete="given-name"
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={formData.lastName}
              onChange={handleChange('lastName')}
              disabled={loading}
              autoComplete="family-name"
            />
            <TextField
              label="Phone Number"
              fullWidth
              required
              placeholder="e.g. 0123456789"
              value={formData.phoneNumber}
              onChange={handleChange('phoneNumber')}
              disabled={loading}
              autoComplete="tel"
              helperText="A South African mobile number the school can reach you on"
            />
          </Box>

          {/* Submit */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 4 }}
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Register'}
          </Button>

        </CardContent>
      </Card>
    </Box>
  );
};

export default IrenePrimaryRegistration;