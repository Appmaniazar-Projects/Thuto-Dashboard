import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Grid, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, FormControl, InputLabel, Select, MenuItem,
  Divider, CircularProgress, Alert, Button, TextField
} from '@mui/material';

import {
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import parentService from '../../services/parentService';
import { formatDisplayDate } from '../../utils/date';

const ParentAttendance = () => {
  const { user: parent } = useAuth();
  const location = useLocation();
  const [children, setChildren] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangeError, setRangeError] = useState('');

  const defaultRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const [startDate, setStartDate] = useState(() => defaultRange().startDate);
  const [endDate, setEndDate] = useState(() => defaultRange().endDate);

  const queryStudentId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('studentId');
    return id ? id.toString() : '';
  }, [location.search]);

  const coerceId = (id) => {
    if (id === null || id === undefined || id === '') return '';
    const num = Number(id);
    return Number.isNaN(num) ? id : num;
  };

  const fetchAttendanceForChild = useCallback(async (childId) => {
    if (!childId) return;

    setRangeError('');

    if (!startDate || !endDate) {
      setRangeError('Please select a start date and end date.');
      setAttendanceData((prev) => ({
        ...prev,
        [childId]: []
      }));
      return;
    }

    const startDt = new Date(startDate);
    const endDt = new Date(endDate);

    if (Number.isNaN(startDt.getTime()) || Number.isNaN(endDt.getTime())) {
      setRangeError('Please select a valid date range.');
      setAttendanceData((prev) => ({
        ...prev,
        [childId]: []
      }));
      return;
    }

    if (startDt.getTime() > endDt.getTime()) {
      setRangeError('Start date must be before end date.');
      setAttendanceData((prev) => ({
        ...prev,
        [childId]: []
      }));
      return;
    }

    const data = await parentService.getChildAttendance(childId, { startDate, endDate });
    setAttendanceData(prev => ({
      ...prev,
      [childId]: Array.isArray(data) ? data : []
    }));
  }, [startDate, endDate]);

  useEffect(() => {
    const loadInitialData = async () => {

      console.log('ParentReportsPage - Parent object:', parent);
      console.log('ParentReportsPage - Phone number:', parent?.phoneNumber);
      
      if (!parent) {
        console.log('ParentReportsPage - No parent object found');
        setLoading(false);
        return;
      }

      // Check if parent has phoneNumber
      if (!parent.phoneNumber) {
        console.error('ParentReportsPage - No phone number found in parent object');
        setError('Phone number not found. Please update your profile.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('ParentReportsPage - Calling getMyChildren with phoneNumber:', parent.phoneNumber);
        // 1. Fetch children directly from the parentService
        const childProfiles = await parentService.getMyChildren(parent.phoneNumber);
        setChildren(childProfiles);

        // 2. Default to querystring child if present, otherwise first child
        if (childProfiles.length > 0) {
          const queryId = coerceId(queryStudentId);
          const queryExists = queryId
            ? childProfiles.some(c => String(c.id) === String(queryId))
            : false;
          const initialChildId = queryExists ? queryId : childProfiles[0].id;

          setSelectedChildId(initialChildId);
        } else {
          setError('No children are linked to your profile.');
        }

      } catch (err) {
        setError('Failed to load attendance data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [parent, queryStudentId]);

  useEffect(() => {
    if (!selectedChildId) return;
    fetchAttendanceForChild(selectedChildId);
  }, [selectedChildId, startDate, endDate, fetchAttendanceForChild]);

  const handleChildChange = (event) => {
    setSelectedChildId(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
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

  const currentChildData = useMemo(() => {
    const allData = attendanceData[selectedChildId] || [];
    if (!startDate || !endDate) return allData;
    const from = new Date(startDate);
    const to = new Date(endDate);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return allData;
    const fromTime = from.getTime();
    const toTime = to.getTime();

    return allData.filter((record) => {
      const recordDate = new Date(record.date);
      if (Number.isNaN(recordDate.getTime())) return false;
      const t = recordDate.getTime();
      return t >= fromTime && t <= toTime;
    });
  }, [attendanceData, selectedChildId, startDate, endDate]);

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

  const handleDownloadReport = (childId, format = 'pdf') => {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    // In a real app, this would call your API to generate a report
    const reportData = {
      childName: `${child.firstName} ${child.lastName}`,
      date: new Date().toISOString().split('T')[0],
      attendanceStats: attendanceData[childId]?.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      }, { total: attendanceData[childId]?.length || 0 })
    };

    // Create a simple report (in a real app, this would be generated by the backend)
    const reportContent = `
      Attendance Report - ${reportData.childName}
      Generated on: ${formatDisplayDate(new Date())}
      ===========================================
      
      Total Records: ${reportData.attendanceStats.total || 0}
      Present: ${reportData.attendanceStats.present || 0}
      Absent: ${reportData.attendanceStats.absent || 0}
      Late: ${reportData.attendanceStats.late || 0}
    `;

    // Create a blob and download link
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${child.firstName}-${child.lastName}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
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
        </Paper>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (children.length === 0) {
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="child-select-label">Select Child</InputLabel>
              <Select
                labelId="child-select-label"
                value={selectedChildId}
                label="Select Child"
                onChange={handleChildChange}
              >
                {children.map((child) => (
                  <MenuItem key={child.id} value={child.id}>
                    {child.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Start"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="End"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadReport(selectedChildId)}
              fullWidth
            >
              Download Report
            </Button>
          </Grid>
        </Grid>

        {rangeError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {rangeError}
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
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
                        <TableCell>{formatDisplayDate(record.date)}</TableCell>
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
                          No attendance records found for the selected date range.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

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
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Total School Days:
                </Typography>
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