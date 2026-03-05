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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Chip
} from '@mui/material';
import { BugReport as BugIcon, Send as SendIcon } from '@mui/icons-material';

const BugReport = ({ open, onClose, user }) => {
  const [formData, setFormData] = useState({
    issueType: '',
    severity: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    browser: '',
    userRole: user?.role || '',
    page: window.location.pathname
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.issueType || !formData.severity || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create bug report data
      const bugReport = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        userEmail: user?.email || 'anonymous',
        userName: user?.name ? `${user.name} ${user.lastName || ''}` : 'Anonymous User'
      };

      // Here you would normally send to your backend
      // For now, we'll create a downloadable report
      const reportContent = `
BUG REPORT - ${new Date().toLocaleDateString()}

========================================
USER INFORMATION
========================================
Name: ${bugReport.userName}
Email: ${bugReport.userEmail}
Role: ${bugReport.userRole}
Page: ${bugReport.page}
Timestamp: ${bugReport.timestamp}

========================================
ISSUE DETAILS
========================================
Issue Type: ${bugReport.issueType}
Severity: ${bugReport.severity}
Description: ${bugReport.description}

Steps to Reproduce:
${bugReport.stepsToReproduce || 'Not provided'}

Expected Behavior:
${bugReport.expectedBehavior || 'Not provided'}

Actual Behavior:
${bugReport.actualBehavior || 'Not provided'}

========================================
TECHNICAL INFORMATION
========================================
Browser: ${bugReport.browser}
User Agent: ${bugReport.userAgent}
Screen Resolution: ${bugReport.screenResolution}
      `.trim();

      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bug_report_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        resetForm();
      }, 2000);

    } catch (err) {
      setError('Failed to submit bug report. Please try again.');
      console.error('Bug report submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      issueType: '',
      severity: '',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      browser: '',
      userRole: user?.role || '',
      page: window.location.pathname
    });
    setError('');
  };

  const issueTypes = [
    'Bug/Error',
    'Performance Issue',
    'UI/UX Problem',
    'Feature Request',
    'Documentation Issue',
    'Other'
  ];

  const severities = [
    'Critical - System unusable',
    'High - Major functionality broken',
    'Medium - Workaround exists',
    'Low - Minor issue'
  ];

  const browsers = [
    'Chrome',
    'Firefox',
    'Safari',
    'Edge',
    'Mobile (iOS)',
    'Mobile (Android)',
    'Other'
  ];

  if (submitted) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Bug Report Submitted Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thank you for helping improve Thuto Dashboard. Your report has been downloaded.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon color="error" />
          <Typography variant="h6">Report a Bug</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Issue Type</InputLabel>
              <Select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                label="Issue Type"
              >
                {issueTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Severity</InputLabel>
              <Select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                label="Severity"
              >
                {severities.map(severity => (
                  <MenuItem key={severity} value={severity}>{severity}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            helperText="Describe the issue you encountered"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Steps to Reproduce"
            name="stepsToReproduce"
            value={formData.stepsToReproduce}
            onChange={handleChange}
            margin="normal"
            helperText="Step-by-step instructions to reproduce the issue"
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Expected Behavior"
              name="expectedBehavior"
              value={formData.expectedBehavior}
              onChange={handleChange}
              helperText="What should have happened"
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Actual Behavior"
              name="actualBehavior"
              value={formData.actualBehavior}
              onChange={handleChange}
              helperText="What actually happened"
            />
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Browser</InputLabel>
            <Select
              name="browser"
              value={formData.browser}
              onChange={handleChange}
              label="Browser"
            >
              {browsers.map(browser => (
                <MenuItem key={browser} value={browser}>{browser}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Page: <Chip label={formData.page} size="small" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your Role: <Chip label={formData.userRole} size="small" color="primary" />
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
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BugReport;
