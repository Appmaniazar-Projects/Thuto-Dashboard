import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Divider,
  FormControl, InputLabel, Select, MenuItem, Grid, Paper, Switch, FormControlLabel
} from '@mui/material';
import { Save as SaveIcon, Notifications as NotificationsIcon, 
  Security as SecurityIcon, School as SchoolIcon } from '@mui/icons-material';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    schoolName: 'Thuto Academy',
    academicYear: '2024/2025',
    timezone: 'Africa/Johannesburg',
    enableNotifications: true,
    maintenanceMode: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30, // minutes
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend API
    console.log('Saving settings:', settings);
    // Show success message
  };

  const timezones = [
    'Africa/Johannesburg',
    'Africa/Cairo',
    'Africa/Lagos',
    'UTC',
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* School Information */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">School Information</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="School Name"
                      name="schoolName"
                      value={settings.schoolName}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Academic Year"
                      name="academicYear"
                      value={settings.academicYear}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        name="timezone"
                        value={settings.timezone}
                        onChange={handleChange}
                        label="Timezone"
                      >
                        {timezones.map((tz) => (
                          <MenuItem key={tz} value={tz}>
                            {tz}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Security Settings</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={handleChange}
                          name="maintenanceMode"
                          color="primary"
                        />
                      }
                      label="Maintenance Mode"
                    />
                    <Typography variant="caption" display="block" color="textSecondary">
                      When enabled, only administrators can access the system
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Login Attempts"
                      name="maxLoginAttempts"
                      value={settings.maxLoginAttempts}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Session Timeout (minutes)"
                      name="sessionTimeout"
                      value={settings.sessionTimeout}
                      onChange={handleChange}
                      margin="normal"
                      variant="outlined"
                      inputProps={{ min: 5, max: 120 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Notification Settings</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableNotifications}
                      onChange={handleChange}
                      name="enableNotifications"
                      color="primary"
                    />
                  }
                  label="Enable Email Notifications"
                />
                <Typography variant="caption" display="block" color="textSecondary">
                  Enable or disable system-wide email notifications
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
              >
                Save Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default SystemSettings;
