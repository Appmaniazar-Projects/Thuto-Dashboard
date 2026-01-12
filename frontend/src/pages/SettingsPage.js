import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  Typography
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    weeklySummary: true,
    darkMode: false
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('app_settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.warn('Failed to load app_settings from localStorage', err);
    }
  }, [currentUser]);

  const displayRole = useMemo(() => {
    return String(currentUser?.role || 'N/A').toUpperCase();
  }, [currentUser]);

  const handleSettingChange = (key) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [key]: event.target.checked
    }));
  };

  const handleSave = () => {
    try {
      setSaveError('');
      setSaveStatus('');
      setIsSaving(true);
      localStorage.setItem('app_settings', JSON.stringify(settings));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      setSaveError(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage system preferences and notifications
        </Typography>
      </Box>

      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved
        </Alert>
      )}

      {saveError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      ) : null}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Account
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Signed in as
          </Typography>
          <Typography sx={{ mb: 0.5 }}>
            {(currentUser.name || currentUser.displayName || 'N/A')} {currentUser.lastName || ''}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {currentUser.email || currentUser.phoneNumber || 'N/A'} • {displayRole}
          </Typography>

          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/profile')}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon sx={{ mr: 1 }} />
            Notifications
          </Typography>
          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={!!settings.emailNotifications}
                onChange={handleSettingChange('emailNotifications')}
              />
            }
            label="Email notifications"
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!settings.systemAlerts}
                onChange={handleSettingChange('systemAlerts')}
              />
            }
            label="System alerts"
          />

          <FormControlLabel
            control={
              <Switch
                checked={!!settings.weeklySummary}
                onChange={handleSettingChange('weeklySummary')}
              />
            }
            label="Weekly summary"
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 1 }} />
            Preferences
          </Typography>
          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={!!settings.darkMode}
                onChange={handleSettingChange('darkMode')}
                disabled
              />
            }
            label="Dark mode (coming soon)"
          />
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;