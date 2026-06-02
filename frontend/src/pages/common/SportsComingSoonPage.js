import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Grid, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, SentimentVeryDissatisfied as ComingSoonIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageTitle from '../../components/common/PageTitle';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '@mui/material';

const SportsComingSoonPage = () => {
  const navigate = useNavigate();
  const { sport } = useParams();
  const { isNationalSuperAdmin, isProvincialSuperAdmin } = useAuth();
  const canAccess = !isNationalSuperAdmin() && !isProvincialSuperAdmin();

  const sportsData = {
    soccer: {
      name: 'Soccer',
      description: 'Football/Soccer activities, leagues, and events',
      emoji: '⚽',
      color: 'primary'
    },
    netball: {
      name: 'Netball',
      description: 'Netball teams, matches, and tournaments',
      emoji: '🏀',
      color: 'error'
    },
    rugby: {
      name: 'Rugby',
      description: 'Rugby teams and competitions',
      emoji: '🏈',
      color: 'info'
    },
    athletics: {
      name: 'Athletics',
      description: 'Track and field events',
      emoji: '🏃',
      color: 'success'
    },
    cricket: {
      name: 'Cricket',
      description: 'Cricket matches and tournaments',
      emoji: '🏏',
      color: 'warning'
    }
  };

  const sportKey = sport?.toLowerCase();
  const sportInfo = sportsData[sportKey] || {
    name: 'Sport',
    description: 'Sport activities and events',
    emoji: '🎯',
    color: 'secondary'
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <PageTitle
          title={sportInfo.name}
          subtitle="Coming Soon"
        />

        {!canAccess ? (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Sports Center is not available for National or Provincial admin roles.
          </Alert>
        ) : (
          <Card
            elevation={6}
            sx={{
              maxWidth: 720,
              mx: 'auto',
              textAlign: 'center',
              py: 5,
              px: 3,
              background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)`,
              borderRadius: 2,
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}
          >
          <CardContent>
            {/* Large Emoji */}
            <Box sx={{ fontSize: '80px', mb: 2 }}>
              {sportInfo.emoji}
            </Box>

            {/* Title */}
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#1f2937' }}>
              {sportInfo.name}
            </Typography>

            {/* Description */}
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}
            >
              {sportInfo.description}
            </Typography>

            {/* Coming Soon Badge */}
            <Box sx={{ mb: 4 }}>
              <Chip
                icon={<ComingSoonIcon />}
                label="Coming Soon"
                color="primary"
                variant="outlined"
                size="medium"
                sx={{ fontSize: '16px', padding: '24px 16px' }}
              />
            </Box>

            {/* Status Message */}
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: '#6b7280',
                fontSize: '16px',
                maxWidth: '520px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              We're working on bringing {sportInfo.name} features to the Thuto Dashboard.
              This section will include team management, schedules, results, and statistics.
            </Typography>

            {/* Feature Teaser */}
            <Box sx={{ my: 4, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 'bold' }}>
                Coming Features:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    ✓ Team Management
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    ✓ Event Scheduling
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    ✓ Match Results
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    ✓ Statistics & Leaderboards
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Back Button */}
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ mt: 3 }}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
        )}

        {/* Additional Info */}
        <Box sx={{ mt: 6, p: 3, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#374151', fontWeight: 'bold' }}>
            Stay Updated
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back soon for {sportInfo.name} updates! We're committed to making the Thuto Dashboard
            a comprehensive sports management platform.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SportsComingSoonPage;
