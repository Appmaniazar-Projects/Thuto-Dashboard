import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Chip
} from '@mui/material';
import { BugReport as BugIcon, Send as SendIcon } from '@mui/icons-material';
import { createBug } from '../../services/bugService';


const BugReport = ({ open, onClose, user }) => {
  const initialFormState = {
    description: '',
    expectedBehavior: '',
    actualBehavior: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim() || !formData.expectedBehavior.trim() || !formData.actualBehavior.trim()) {
      setError('Please fill in all fields so we understand what went wrong.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const bugReport = {
        description: formData.description.trim(),
        expectedBehavior: formData.expectedBehavior.trim(),
        actualBehavior: formData.actualBehavior.trim(),
        // Auto-captured — the user never has to think about these.
        role: user?.role || 'unknown',
        schoolId: user?.schoolId || user?.school?.id || null,
        page: window.location.pathname,
        userEmail: user?.email || 'anonymous',
        userName: user?.name ? `${user.name} ${user.lastName || ''}`.trim() : 'Anonymous User'
      };

      await createBug(bugReport);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to submit bug report. Please try again.'
      );
      console.error('Bug report submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Thanks — we've got it!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your report has been sent through to our team.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon color="error" />
          <Typography variant="h6">Report a Problem</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="What went wrong?"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            helperText="Tell us what happened, in your own words"
            autoFocus
          />

          <TextField
            fullWidth
            required
            multiline
            rows={2}
            label="What did you expect to happen?"
            name="expectedBehavior"
            value={formData.expectedBehavior}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            multiline
            rows={2}
            label="What actually happened?"
            name="actualBehavior"
            value={formData.actualBehavior}
            onChange={handleChange}
            margin="normal"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Sending as: <Chip label={user?.role || 'unknown'} size="small" color="primary" />
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? null : <SendIcon />}
          >
            {submitting ? 'Sending...' : 'Send Report'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BugReport;