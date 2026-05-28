import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/common/PageTitle';
import { useAuth } from '../../context/AuthContext';

const sports = [
  { key: 'athletics', label: 'Athletics', description: 'Track and field events and school athletics programs' },
  { key: 'cricket', label: 'Cricket', description: 'School cricket teams, fixtures and results' },
  { key: 'netball', label: 'Netball', description: 'Netball team management and tournaments' },
  { key: 'rugby', label: 'Rugby', description: 'Rugby competitions and training schedules' },
  { key: 'soccer', label: 'Soccer', description: 'Soccer clubs, matches, and squad details' }
];

const SportsCenterPage = () => {
  const navigate = useNavigate();
  const { currentUser, isNationalSuperAdmin, isProvincialSuperAdmin } = useAuth();
  const canAccess = !isNationalSuperAdmin() && !isProvincialSuperAdmin();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6fb', py: 4 }}>
      <PageTitle title="Sports Center" subtitle="Explore sports management tools and upcoming features" />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        {!canAccess ? (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Sports Center is not available for National or Provincial admin roles.
          </Alert>
        ) : (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Choose a sport to see what’s coming next. Each sport currently links to a placeholder page while the feature is being built.
          </Typography>
        )}

        {canAccess && (
          <Grid container spacing={3}>
            {sports.map((sport) => (
              <Grid key={sport.key} item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: 3, minHeight: 220, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {sport.label}
                      </Typography>
                      <Chip label="Coming Soon" color="primary" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, minHeight: 64 }}>
                      {sport.description}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/superadmin/sports/${sport.key}`)}
                      sx={{ mt: 'auto' }}
                    >
                      View {sport.label}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SportsCenterPage;
