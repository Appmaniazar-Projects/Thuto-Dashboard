import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Chip } from '@mui/material';
import { BarChart, People, School, MonetizationOn } from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';

const reports = [
  {
    title: 'User Statistics Report',
    description: 'View comprehensive user statistics including registrations, role distribution, and account status.',
    icon: <People sx={{ fontSize: 40 }} />,
    path: '/admin/reports/users',
    available: true,
  },
  {
    title: 'Attendance Submissions Report',
    description: 'Monitor teacher attendance submissions, approval rates, and submission trends.',
    icon: <School sx={{ fontSize: 40 }} />,
    path: '/admin/reports/attendance',
    available: true,
  },
  {
    title: 'Financial Reports',
    description: 'Track fee collections, view outstanding payments, and generate financial summaries.',
    icon: <MonetizationOn sx={{ fontSize: 40 }} />,
    path: '/admin/reports/financial',
    available: false,
  },
];

export const Reports = () => {
  const navigate = useNavigate();

  const handleNavigation = (report) => {
    if (report.available) {
      navigate(report.path);
    }
  };

  return (
    <Box>
      <PageTitle title="Reports Center" subtitle="Generate and view detailed reports for school management and administration." />

      <Grid container spacing={3}>
        {reports.map((report, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardActionArea 
                sx={{ p: 2, height: '100%' }} 
                onClick={() => handleNavigation(report)}
                disabled={!report.available}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {report.icon}
                  <Typography gutterBottom variant="h5" component="div" sx={{ mt: 2 }}>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.description}
                  </Typography>
                  {!report.available && (
                    <Chip 
                      label="Coming Soon" 
                      color="info" 
                      size="small" 
                      sx={{ mt: 2 }}
                    />
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
