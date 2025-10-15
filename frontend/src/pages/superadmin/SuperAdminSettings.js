// Replace the entire SuperAdminSettings.js with this simplified version:

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/common/PageTitle';

const SuperAdminSettings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    weeklyReports: true,
    darkMode: false
  });
  const [saveStatus, setSaveStatus] = useState(null);

  const handleBack = () => {
    navigate('/superadmin/dashboard');
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleSave = () => {
    // Simulate save
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          onClick={handleBack} 
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        </Box>
        <PageTitle 
          title="Settings" 
          subtitle="Manage your preferences and account settings" 
        />

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Notifications Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            Notifications
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleSettingChange('emailNotifications')}
              />
            }
            label="Email Notifications"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.systemAlerts}
                onChange={handleSettingChange('systemAlerts')}
              />
            }
            label="System Alerts"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.weeklyReports}
                onChange={handleSettingChange('weeklyReports')}
              />
            }
            label="Weekly Reports"
          />
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Appearance
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.darkMode}
                onChange={handleSettingChange('darkMode')}
                disabled
              />
            }
            label="Dark Mode (Coming Soon)"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          size="large"
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SuperAdminSettings;