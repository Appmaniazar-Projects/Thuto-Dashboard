import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  School as SchoolIcon,
  DashboardCustomize as DashboardIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import Logo from '../../assets/Logo_Dashboard.png';

const AdminLandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, setSelectedSchool } = useAuth();

  const [schools, setSchools]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selectedSchoolData, setSelectedSchoolData] = useState(null);

  // ── fetch schools ──────────────────────────────────────────────
  useEffect(() => {
    const fetchAdminSchools = async () => {
      try {
        setLoading(true);
        const ids = currentUser?.schoolIds;
        const hasSchoolIds = Array.isArray(ids) && ids.length > 0;

        if (hasSchoolIds) {
          let schoolList = [];
          try {
            schoolList = await adminService.getAdminSchools(currentUser.id);
          } catch {
            schoolList = ids.map(id => ({ id, name: `School ${id}` }));
          }
          setSchools(schoolList || []);
        } else if (currentUser?.schoolId) {
          setSchools([{ id: currentUser.schoolId, name: currentUser.schoolName || 'Your School' }]);
        }
        setError(null);
      } catch {
        setError('Failed to load your schools. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) fetchAdminSchools();
  }, [currentUser?.id, currentUser?.schoolIds, currentUser?.schoolId]);

  // ── auto-redirect single school ────────────────────────────────
  const handleSelectSchool = useCallback((school) => {
    setSelectedSchoolData(school);
    setSelectedSchool(school);
    localStorage.setItem('schoolId', String(school.id));
    localStorage.setItem('schoolName', school.name || '');
    navigate('/dashboard', { state: { selectedSchool: school } });
  }, [navigate, setSelectedSchool]);

  useEffect(() => {
    if (!loading && schools.length === 1) {
      handleSelectSchool(schools[0]);
    }
  }, [loading, schools, handleSelectSchool]);

  // ── loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F7F8FA',
        }}
      >
        <TopBar />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">Loading your schools…</Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  // ── single school — briefly shows while auto-redirect fires ────
  if (schools.length <= 1) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F7F8FA' }}>
        <TopBar />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // ── school picker ──────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F7F8FA' }}>
      <TopBar />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 6 },
          maxWidth: 960,
          mx: 'auto',
          width: '100%',
        }}
      >
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h4"
            fontWeight={600}
            sx={{ mb: 1, color: 'text.primary', letterSpacing: '-0.5px' }}
          >
            Select a school
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose the school you want to manage
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 640 }}>
            {error}
          </Alert>
        )}

        {/* School cards */}
        <Grid container spacing={3} justifyContent="center">
          {schools.map((school) => {
            const isSelected = selectedSchoolData?.id === school.id;
            return (
              <Grid item xs={12} sm={6} md={4} key={school.id}>
                <Card
                  onClick={() => handleSelectSchool(school)}
                  elevation={0}
                  sx={{
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderRadius: 3,
                    bgcolor: isSelected ? 'primary.50' : 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <SchoolIcon sx={{ color: '#fff', fontSize: 24 }} />
                    </Box>

                    {/* Name */}
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ mb: 1.5, lineHeight: 1.3, fontSize: '1rem' }}
                    >
                      {school.name}
                    </Typography>

                    {/* Meta chips */}
                    <Stack spacing={0.75} sx={{ mb: 2.5 }}>
                      {school.region && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocationIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {school.region}
                          </Typography>
                        </Box>
                      )}
                      {school.province && !school.region && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocationIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {school.province}
                          </Typography>
                        </Box>
                      )}
                      {school.principalName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <PersonIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {school.principalName}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Button
                      variant={isSelected ? 'contained' : 'outlined'}
                      size="small"
                      fullWidth
                      startIcon={<DashboardIcon fontSize="small" />}
                      onClick={(e) => { e.stopPropagation(); handleSelectSchool(school); }}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                      Go to dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Footer count */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 5 }}
        >
          {schools.length} school{schools.length !== 1 ? 's' : ''} assigned to your account
        </Typography>
      </Box>
    </Box>
  );
};

// ── Standalone topbar — no sidebar, just logo ──────────────────
const TopBar = () => (
  <AppBar
    position="static"
    elevation={0}
    sx={{
      bgcolor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Toolbar sx={{ minHeight: 56, px: { xs: 2, sm: 3 } }}>
      <Box
        component="img"
        src={Logo}
        alt="Thuto"
        sx={{ height: 32, width: 'auto', objectFit: 'contain' }}
        onError={(e) => {
          // fallback text if logo doesn't load
          e.target.style.display = 'none';
        }}
      />
      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" color="text.disabled" sx={{ display: { xs: 'none', sm: 'block' } }}>
        School Management
      </Typography>
    </Toolbar>
  </AppBar>
);

export default AdminLandingPage;