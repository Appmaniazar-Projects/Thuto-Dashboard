import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Divider, CircularProgress, Alert
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getUsersByIds } from '../../services/userService';
import { fetchAttendanceForChildren } from '../../services/attendanceService';

const ParentAttendance = () => {
  const { user: parent } = useAuth();
  const [children, setChildren] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!parent || !parent.children || parent.children.length === 0) {
        setError('No children are linked to your profile.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch the profiles of the children linked to the parent
        const childProfiles = await getUsersByIds(parent.children);
        setChildren(childProfiles);

        // 2. Fetch attendance data for those children
        const attendance = await fetchAttendanceForChildren(parent.children);
        setAttendanceData(attendance);

        // 3. Set the first child as the default selection
        if (childProfiles.length > 0) {
          setSelectedChildId(childProfiles[0].id);
        }

      } catch (err) {
        setError('Failed to load attendance data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [parent]);

  const handleChildChange = (event) => {
    setSelectedChildId(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <PresentIcon fontSize="small" />;
      case 'Absent': return <AbsentIcon fontSize="small" />;
      case 'Late': return <LateIcon fontSize="small" />;
      default: return null;
    }
  };

  const currentChildData = attendanceData[selectedChildId] || [];
  const selectedChildInfo = children.find(child => child.id === selectedChildId);

  const attendanceSummary = useMemo(() => {
    const summary = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Total: currentChildData.length
    };
    currentChildData.forEach(record => {
      if (summary[record.status] !== undefined) {
        summary[record.status]++;
      }
    });
    return summary;
  }, [currentChildData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (children.length === 0 && !loading) {
    return <Alert severity="info" sx={{ m: 3 }}>No children have been assigned to your profile yet.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Children's Attendance
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Track your children's daily attendance records and view attendance statistics.
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="child-select-label">Select Child</InputLabel>
              <Select
                labelId="child-select-label"
                value={selectedChildId}
                label="Select Child"
                onChange={handleChildChange}
              >
                {children.map(child => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Attendance Records */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Attendance Log for {selectedChildInfo?.name}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentChildData.length > 0 ? (
                    currentChildData.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(record.status)}
                            label={record.status}
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{record.time || '—'}</TableCell>
                        <TableCell>{record.note || '—'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography sx={{ p: 3, color: 'text.secondary' }}>
                          No attendance records found for this month.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: Attendance Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <PieChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Attendance Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography>Present:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {attendanceSummary.Present} days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography>Absent:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {attendanceSummary.Absent} days
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography>Late:</Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {attendanceSummary.Late} days
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total School Days:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {attendanceSummary.Total}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentAttendance;