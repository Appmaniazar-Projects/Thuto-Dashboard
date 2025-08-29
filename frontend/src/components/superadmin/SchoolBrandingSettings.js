import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, 
  Grid, Avatar, Alert, Divider, IconButton, Tooltip
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  Palette as PaletteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { useSchoolBranding } from '../../context/SchoolBrandingContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const SchoolBrandingSettings = ({ schoolId, schoolName }) => {
  const { branding, updateSchoolBranding, refreshBranding } = useSchoolBranding();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    logo: null,
    schoolName: schoolName || 'School Name'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user has permission to edit branding
  const canEditBranding = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'administrator';

  useEffect(() => {
    if (branding) {
      setFormData({
        primaryColor: branding.primaryColor || '#1976d2',
        secondaryColor: branding.secondaryColor || '#dc004e',
        logo: branding.logo,
        schoolName: branding.schoolName || schoolName || 'School Name'
      });
      setLogoPreview(branding.logo);
    }
  }, [branding, schoolName]);

  const handleColorChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Logo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSave = async () => {
    // For school admin, use their school ID; for super admin, use provided schoolId
    const targetSchoolId = user?.role === 'superadmin' ? schoolId : user?.schoolId;
    
    if (!targetSchoolId) {
      setError('School ID is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const brandingData = {
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        schoolName: formData.schoolName
      };

      // If there's a new logo file, convert to base64 or handle upload
      if (logoFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          brandingData.logo = e.target.result; // Base64 string
          
          await updateSchoolBranding(targetSchoolId, brandingData);
          setSuccess('School branding updated successfully!');
          setLogoFile(null);
        };
        reader.readAsDataURL(logoFile);
      } else {
        await updateSchoolBranding(targetSchoolId, brandingData);
        setSuccess('School branding updated successfully!');
      }
    } catch (err) {
      setError('Failed to update school branding: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    refreshBranding();
    setLogoFile(null);
    setError('');
    setSuccess('');
  };

  if (!canEditBranding) {
    return (
      <Alert severity="warning">
        You don't have permission to manage school branding settings.
      </Alert>
    );
  }

  if (user?.role !== 'superadmin' && !user?.schoolId) {
    return (
      <Alert severity="warning">
        No school associated with your account. Please contact support.
      </Alert>
    );
  }

  if (user?.role === 'superadmin' && !schoolId) {
    return (
      <Alert severity="warning">
        Please select a school to manage branding settings.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PaletteIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            School Branding Settings
          </Typography>
          <Tooltip title="Refresh settings">
            <IconButton onClick={handleReset} sx={{ ml: 'auto' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {user?.role === 'admin' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            As a school administrator, you can customize your school's branding.
          </Alert>
        )}

        {error && <ErrorDisplay error={error} sx={{ mb: 2, p: 0 }} />}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Logo Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              School Logo
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={logoPreview}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 2,
                  bgcolor: formData.primaryColor
                }}
              >
                {formData.schoolName.charAt(0)}
              </Avatar>
              
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 1 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Button>
                <Typography variant="caption" display="block" color="text.secondary">
                  Max size: 5MB. Recommended: 200x200px
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* School Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="School Name"
              value={formData.schoolName}
              onChange={(e) => handleColorChange('schoolName', e.target.value)}
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Color Settings */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Color Theme
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Primary Color"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                sx={{ width: 100 }}
                InputProps={{
                  sx: { height: 56 }
                }}
              />
              <TextField
                fullWidth
                label="Primary Color (Hex)"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                placeholder="#1976d2"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Used for buttons, links, and primary elements
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Secondary Color"
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                sx={{ width: 100 }}
                InputProps={{
                  sx: { height: 56 }
                }}
              />
              <TextField
                fullWidth
                label="Secondary Color (Hex)"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                placeholder="#dc004e"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Used for accents and secondary elements
            </Typography>
          </Grid>

          {/* Preview */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Preview
            </Typography>
            
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Button 
                variant="contained" 
                sx={{ 
                  mr: 2, 
                  bgcolor: formData.primaryColor,
                  '&:hover': { bgcolor: formData.primaryColor }
                }}
              >
                Primary Button
              </Button>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderColor: formData.secondaryColor,
                  color: formData.secondaryColor,
                  '&:hover': { 
                    borderColor: formData.secondaryColor,
                    bgcolor: formData.secondaryColor + '10'
                  }
                }}
              >
                Secondary Button
              </Button>
            </Box>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={loading ? <LoadingSpinner size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                size="large"
              >
                {loading ? 'Saving...' : 'Save Branding'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SchoolBrandingSettings;
