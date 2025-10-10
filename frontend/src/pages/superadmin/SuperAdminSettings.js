import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  Paper,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import PageTitle from '../../components/common/PageTitle';

const SuperAdminSettings = () => {
  const { currentUser, isMaster } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    weeklyReports: true,
    darkMode: false,
    compactView: false,
    autoLogout: 30,
    sessionTimeout: 60,
    twoFactorAuth: false,
    loginAlerts: true
  });

  const [saveStatus, setSaveStatus] = useState(null);

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked !== undefined ? event.target.checked : event.target.value
    }));
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <Box>
      <PageTitle 
        title="Settings" 
        subtitle="Configure your preferences and system settings" 
      />

      {saveStatus && (
        <Alert 
          severity={saveStatus === 'success' ? 'success' : saveStatus === 'error' ? 'error' : 'info'}
          sx={{ mb: 3 }}
        >
          {saveStatus === 'success' && 'Settings saved successfully!'}
          {saveStatus === 'error' && 'Failed to save settings. Please try again.'}
          {saveStatus === 'saving' && 'Saving settings...'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                Notification Preferences
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleSettingChange('emailNotifications')}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={handleSettingChange('smsNotifications')}
                      color="primary"
                    />
                  }
                  label="SMS Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemAlerts}
                      onChange={handleSettingChange('systemAlerts')}
                      color="primary"
                    />
                  }
                  label="System Alerts"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.weeklyReports}
                      onChange={handleSettingChange('weeklyReports')}
                      color="primary"
                    />
                  }
                  label="Weekly Reports"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1 }} />
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={handleSettingChange('twoFactorAuth')}
                      color="primary"
                    />
                  }
                  label="Two-Factor Authentication"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.loginAlerts}
                      onChange={handleSettingChange('loginAlerts')}
                      color="primary"
                    />
                  }
                  label="Login Alerts"
                />
                
                <TextField
                  select
                  label="Auto Logout (minutes)"
                  value={settings.autoLogout}
                  onChange={handleSettingChange('autoLogout')}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </TextField>
                
                <TextField
                  select
                  label="Session Timeout (minutes)"
                  value={settings.sessionTimeout}
                  onChange={handleSettingChange('sessionTimeout')}
                  size="small"
                >
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                  <MenuItem value={240}>4 hours</MenuItem>
                </TextField>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PaletteIcon sx={{ mr: 1 }} />
                Display Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onChange={handleSettingChange('darkMode')}
                      color="primary"
                    />
                  }
                  label="Dark Mode (Coming Soon)"
                  disabled
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.compactView}
                      onChange={handleSettingChange('compactView')}
                      color="primary"
                    />
                  }
                  label="Compact View"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                System Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Access Level
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {isMaster() ? 'Master (National Level)' : 'Provincial SuperAdmin'}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    User ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {currentUser?.id || 'N/A'}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last Login
                  </Typography>
                  <Typography variant="body2">
                    {new Date().toLocaleString()}
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              size="large"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperAdminSettings;
