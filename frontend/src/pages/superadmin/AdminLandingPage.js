import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  School as SchoolIcon,
  DashboardCustomize as DashboardIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import PageTitle from '../../components/common/PageTitle';
import adminService from '../../services/adminService';
import { getRoleDisplayName } from '../../constants/roleLabels';

const AdminLandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, setSelectedSchool, isProvincialSuperAdmin, isNationalSuperAdmin, isRegionalSuperAdmin } = useAuth();
  
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchoolData, setSelectedSchoolData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Fetch admin's schools if multi-school admin
  useEffect(() => {
    const fetchAdminSchools = async () => {
      try {
        setLoading(true);
        
        // Check if admin has multiple schools
        if (currentUser?.schoolIds && Array.isArray(currentUser.schoolIds) && currentUser.schoolIds.length > 1) {
          // Multi-school admin - fetch all their schools
          let schoolList = [];
try {
  schoolList = await adminService.getAdminSchools(currentUser.id);
} catch (err) {
  console.warn('Could not fetch school details, building from schoolIds:', err);
  // Fallback: build basic school objects from the IDs we already have
  const ids = Array.isArray(currentUser.schoolIds) ? currentUser.schoolIds : [];
  schoolList = ids.map(id => ({
    id,
    name: `School ${id}`,
  }));
}
setSchools(schoolList || []);
          // If no selected school yet, select the first one
          if (!selectedSchoolData && schoolList && schoolList.length > 0) {
            setSelectedSchoolData(schoolList[0]);
            setSelectedSchool(schoolList[0]);
          }
        } else if (currentUser?.schoolIds && Array.isArray(currentUser.schoolIds) && currentUser.schoolIds.length === 1) {
          // Multi-school admin - fetch all their schools
          let schoolList = [];
          try {
            schoolList = await adminService.getAdminSchools(currentUser.id);
          } catch (err) {
            console.warn('Could not fetch school details, building from schoolIds:', err);
            // Fallback: build basic school objects from the IDs we already have
            const ids = Array.isArray(currentUser.schoolIds) ? currentUser.schoolIds : [];
            schoolList = ids.map(id => ({
              id,
              name: `School ${id}`,
            }));
          }
          setSchools(schoolList || []);
          
          // If no selected school yet, select the first one
          if (!selectedSchoolData && schoolList && schoolList.length > 0) {
            setSelectedSchoolData(schoolList[0]);
            setSelectedSchool(schoolList[0]);
          }
        } else if (currentUser?.schoolId) {
          // Single-school admin
          const singleSchool = {
            id: currentUser.schoolId,
            name: currentUser.schoolName || 'Your School'
          };
          setSchools([singleSchool]);
          setSelectedSchoolData(singleSchool);
          setSelectedSchool(singleSchool);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch admin schools:', err);
        setError('Failed to load your schools. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchAdminSchools();
    }
  }, [currentUser?.id, currentUser?.schoolIds, currentUser?.schoolId]);

  // Auto-redirect single-school admin to dashboard
  useEffect(() => {
    if (!loading && schools.length === 1 && !selectedSchoolData?.multiSchoolSelector) {
      handleSelectSchool(schools[0]);
    }
  }, [loading, schools]);

  const handleSelectSchool = (school) => {
    setSelectedSchoolData(school);
    setSelectedSchool(school);
    setDialogOpen(false);
    navigate('/dashboard', { state: { selectedSchool: school } });
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // If single school, this page shouldn't be shown (redirects to dashboard)
  if (schools.length <= 1) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Loading your dashboard...
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageTitle
        title={`${getRoleDisplayName(currentUser?.role)} - Welcome`}
        subtitle="You manage multiple schools. Select one to continue."
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Statistics Cards - For National/Provincial/Regional Admins */}
      {(isNationalSuperAdmin() || isProvincialSuperAdmin() || isRegionalSuperAdmin()) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{schools.length}</Typography>
                    <Typography color="text.secondary">Schools Managed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{statistics?.totalStudents || 0}</Typography>
                    <Typography color="text.secondary">Total Students</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{statistics?.totalTeachers || 0}</Typography>
                    <Typography color="text.secondary">Total Teachers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* School Selection */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon />
          Select a School to Manage
        </Typography>

        <Grid container spacing={2}>
          {schools.map((school) => (
            <Grid item xs={12} sm={6} md={4} key={school.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: selectedSchoolData?.id === school.id ? '2px solid' : '1px solid',
                  borderColor: selectedSchoolData?.id === school.id ? 'primary.main' : 'divider',
                  backgroundColor: selectedSchoolData?.id === school.id ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => handleSelectSchool(school)}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        {school.name}
                      </Typography>
                    </Box>

                    {school.region && (
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`Region: ${school.region}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    )}

                    {school.principalName && (
                      <Typography variant="body2" color="text.secondary">
                        Principal: {school.principalName}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      School ID: {school.id}
                    </Typography>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DashboardIcon />}
                      fullWidth
                      onClick={() => handleSelectSchool(school)}
                      sx={{ mt: 1 }}
                    >
                      Go to Dashboard
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* School Selection Dialog - Alternative View */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select a School</DialogTitle>
        <DialogContent>
          <List>
            {schools.map((school) => (
              <ListItem key={school.id} disablePadding>
                <ListItemButton onClick={() => handleSelectSchool(school)}>
                  <ListItemText
                    primary={school.name}
                    secondary={school.region ? `Region: ${school.region}` : 'Regional/National'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLandingPage;
