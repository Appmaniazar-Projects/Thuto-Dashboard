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
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  School as SchoolIcon,
  DashboardCustomize as DashboardIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import TopBar from '../../components/layout/TopBar';

const AdminLandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, setSelectedSchool } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [schools, setSchools]                       = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState(null);
  const [selectedSchoolData, setSelectedSchoolData] = useState(null);

  // ── 1. Fetch schools ───────────────────────────────────────────
  useEffect(() => {
    const fetchAdminSchools = async () => {
      try {
        setLoading(true);
        const ids = currentUser?.schoolIds;
        const hasSchoolIds = Array.isArray(ids) && ids.length > 0;

        if (hasSchoolIds) {
          const schoolsFromLogin =
            Array.isArray(currentUser?.schools) && currentUser.schools.length > 0
              ? currentUser.schools
              : null;

          let schoolList = schoolsFromLogin;

          if (!schoolList) {
            try {
              schoolList = await adminService.getAdminSchools(currentUser.id);
            } catch (err) {
              console.warn('Could not fetch school details, building from schoolIds:', err);
              schoolList = ids.map(id => ({ id, name: `School ${id}` }));
            }
          }

          setSchools(schoolList || []);
        } else if (currentUser?.schoolId) {
          setSchools([{
            id: currentUser.schoolId,
            name: currentUser.schoolName || 'Your School',
          }]);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch admin schools:', err);
        setError('Failed to load your schools. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) fetchAdminSchools();
  }, [currentUser?.id, currentUser?.schoolIds, currentUser?.schoolId, currentUser?.schools]);

  // ── 2. handleSelectSchool ────────────────────────────────────────
  const handleSelectSchool = useCallback((school) => {
    setSelectedSchoolData(school);
    setSelectedSchool(school);
    localStorage.setItem('schoolId', String(school.id));
    localStorage.setItem('schoolName', school.name || '');
    navigate('/dashboard', { state: { selectedSchool: school } });
  }, [navigate, setSelectedSchool]);

  // ── 3. Auto-redirect when only one school ──────────────────────
  useEffect(() => {
    if (!loading && schools.length === 1) {
      handleSelectSchool(schools[0]);
    }
  }, [loading, schools, handleSelectSchool]);

  // ── Shared TopBar props ──────────────────────────────────────────
  const topBarProps = {
    isSuperAdmin: true,
    logoAsImage: true,
    drawerWidth: 0,
    title: isMobile ? 'Thuto' : 'School Management',
  };

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F7F8FA' }}>
        <TopBar {...topBarProps} />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: '64px',
            px: 2,
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Loading your schools…
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  // ── Single school — spinner while auto-redirect fires ──────────
  if (schools.length <= 1) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F7F8FA' }}>
        <TopBar {...topBarProps} />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: '64px',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // ── School picker ──────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F7F8FA' }}>
      <TopBar {...topBarProps} />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 6 },
          mt: '64px',
          maxWidth: 960,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 5 } }}>
          <Typography
            variant="h4"
            fontWeight={600}
            sx={{
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              letterSpacing: { xs: 'normal', sm: '-0.5px' },
            }}
          >
            Select a school
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Choose the school you want to manage
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 640 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
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
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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

                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        mb: 1.5,
                        lineHeight: 1.3,
                        fontSize: '1rem',
                        wordBreak: 'break-word',
                      }}
                    >
                      {school.name}
                    </Typography>

                    <Stack spacing={0.75} sx={{ mb: 2.5 }}>
                      {school.region && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocationIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {school.region}
                          </Typography>
                        </Box>
                      )}
                      {school.province && !school.region && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <LocationIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {school.province}
                          </Typography>
                        </Box>
                      )}
                      {school.principalName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <PersonIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
                          <Typography variant="caption" color="text.secondary" noWrap>
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

        <Typography variant="caption" color="text.disabled" sx={{ mt: 5, textAlign: 'center' }}>
          {schools.length} school{schools.length !== 1 ? 's' : ''} assigned to your account
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminLandingPage;