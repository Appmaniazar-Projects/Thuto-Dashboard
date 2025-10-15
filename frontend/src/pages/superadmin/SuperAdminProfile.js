import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Button,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import PageTitle from '../../components/common/PageTitle';
import { useNavigate } from 'react-router-dom';

const SuperAdminProfile = () => {
    const { currentUser, isMaster, isProvincialSuperAdmin } = useAuth();
    const navigate = useNavigate();
  
    const handleBack = () => {
      navigate('/superadmin/dashboard');
    };

  if (!currentUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  const getAccessLevel = () => {
    if (isMaster()) return 'Master (National Level)';
    if (isProvincialSuperAdmin()) return 'Provincial SuperAdmin';
    return 'SuperAdmin';
  };

  const getAccessLevelColor = () => {
    if (isMaster()) return 'error';
    if (isProvincialSuperAdmin()) return 'warning';
    return 'primary';
  };

  return (
    <Box>
      {/* Header with Back Button */}
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
        title="Profile" 
        subtitle="Manage your account information and settings" 
      />

      {/* Profile Content */}
      <Grid container spacing={3}>
        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'primary.main',
                    mr: 3,
                    fontSize: '2rem'
                  }}
                >
                  {currentUser.name?.charAt(0)?.toUpperCase() || 'S'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {currentUser.name || 'N/A'} {currentUser.lastName || ''}
                  </Typography>
                  <Chip 
                    icon={<AdminIcon />}
                    label={getAccessLevel()}
                    color={getAccessLevelColor()}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    {currentUser.email || 'N/A'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  disabled
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Edit Profile (Coming Soon)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                Account Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      First Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {currentUser.name || 'Not provided'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Last Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {currentUser.lastName || 'Not provided'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {currentUser.email || 'Not provided'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {currentUser.phoneNumber || 'Not provided'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                      Province
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {currentUser.province || (isMaster() ? 'All Provinces' : 'Not assigned')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Access Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminIcon sx={{ mr: 1 }} />
                Access Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Access Level
                </Typography>
                <Chip 
                  label={getAccessLevel()}
                  color={getAccessLevelColor()}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Role
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentUser.role?.toUpperCase() || 'SUPERADMIN'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  User ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {currentUser.id || 'N/A'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Permissions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip size="small" label="School Management" color="success" variant="outlined" />
                  <Chip size="small" label="Admin Management" color="success" variant="outlined" />
                  {isMaster() && (
                    <Chip size="small" label="SuperAdmin Management" color="error" variant="outlined" />
                  )}
                  <Chip size="small" label="System Analytics" color="info" variant="outlined" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SuperAdminProfile;
