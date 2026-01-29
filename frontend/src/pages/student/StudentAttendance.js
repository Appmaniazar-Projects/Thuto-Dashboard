/**
 * StudentAttendance Component
 * 
 * This component displays a student's attendance records in a tabular format
 * with filtering capabilities by month. It fetches attendance data from the
 * backend and provides visual indicators for different attendance statuses.
 * 
 * Features:
 * - Monthly attendance filtering
 * - Visual status indicators (Present, Absent, Late)
 * - Responsive design with loading and error states
 * - Date range selection for attendance records
 * 
 * @component
 * @author Thuto Dashboard Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card, 
  CardContent, 
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Stack,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CalendarToday as CalendarIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  EmojiEvents as AchievementIcon
} from '@mui/icons-material';
import { getStudentAttendance } from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';

/**
 * Main StudentAttendance functional component
 * Manages student attendance display and filtering functionality
 */
const StudentAttendance = () => {
  // Get current authenticated user from context
  const { user } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for selected month filter (format: YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const defaultRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
  };

  const [startDate, setStartDate] = useState(() => defaultRange().startDate);
  const [endDate, setEndDate] = useState(() => defaultRange().endDate);
  
  // State for storing fetched attendance records
  const [attendanceData, setAttendanceData] = useState(null);
  
  // Loading state for API calls
  const [loading, setLoading] = useState(true);
  
  // Error state for handling API failures
  const [error, setError] = useState(null);

  // Derived summary values for safe rendering
  const summary = attendanceData?.summary || {};
  const presentDays = summary.presentDays ?? 0;
  const absentDays = summary.absentDays ?? 0;
  const attendanceRate = summary.attendanceRate ?? 0;

  /**
   * Effect hook to fetch attendance data when component mounts or dependencies change
   * Dependencies: selectedMonth, user
   */
  useEffect(() => {
    /**
     * Async function to fetch student attendance data from the API
     * Handles user validation, date range calculation, and error states
     */
    const fetchAttendance = async () => {
      try {
        // Set loading state and clear any previous errors
        setLoading(true);
        setError(null);
        
        // Validate user authentication before making API call
        if (!user?.id) {
          setError('User information not available. Please log in again.');
          return;
        }
        
        const parsedStart = startDate ? parseISO(startDate) : new Date(selectedMonth + '-01');
        const parsedEnd = endDate
          ? parseISO(endDate)
          : new Date(parsedStart.getFullYear(), parsedStart.getMonth() + 1, 0);

        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
          setError('Please select a valid date range.');
          return;
        }

        if (parsedStart.getTime() > parsedEnd.getTime()) {
          setError('Start date must be before end date.');
          return;
        }
        
        // Fetch attendance data from API service
        const response = await getStudentAttendance(user.id, parsedStart, parsedEnd);
        setAttendanceData(response);
      } catch (err) {
        // Handle API errors gracefully - distinguish between API errors and empty data
        if (err.response?.status === 500 || err.code === 'ERR_NETWORK') {
          setError('Unable to connect to the server. Please check your connection and try again.');
        } else if (err.response?.status === 404) {
          // 404 usually means no attendance records exist yet - treat as empty state
          setAttendanceData({
            summary: {
              presentDays: 0,
              absentDays: 0,
              lateDays: 0,
              attendanceRate: 0,
            },
            details: [],
          });
          setError(null);
        } else {
          setError('Failed to load attendance data. Please try again.');
        }
        console.error('Attendance fetch error:', err);
      } finally {
        // Always clear loading state regardless of success/failure
        setLoading(false);
      }
    };

    // Execute the fetch function
    fetchAttendance();
  }, [selectedMonth, startDate, endDate, user]); // Re-run when month selection or user changes

  useEffect(() => {
    if (!selectedMonth) return;
    const start = new Date(selectedMonth + '-01');
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  }, [selectedMonth]);

  // Function to generate month options for the dropdown
  const generateMonthOptions = () => {
    const months = [];
    const date = new Date();
    
    for (let i = 0; i < 12; i++) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.unshift({
        value: `${year}-${month}`,
        label: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        })
      });
      date.setMonth(date.getMonth() - 1);
    }
    return months;
  };

  const getTeacherLabel = (teacher) => {
    if (!teacher) return 'N/A';
    if (typeof teacher === 'string') return teacher;
    if (typeof teacher === 'object') {
      const parts = [teacher.name, teacher.lastName].filter(Boolean);
      if (parts.length) return parts.join(' ');
      if (teacher.email) return teacher.email;
    }
    return 'N/A';
  };

  const getSubjectLabel = (subject) => {
    if (!subject) return 'N/A';
    if (typeof subject === 'string') return subject;
    if (typeof subject === 'object') {
      return subject.name || subject.subjectName || subject.title || 'N/A';
    }
    return 'N/A';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Title and Month Filter */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h1">
          My Attendance
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Select Month"
              disabled={loading}
            >
              {generateMonthOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
          <TextField
            size="small"
            label="End"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PresentIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Present Days
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {presentDays}
                <Typography component="span" color="textSecondary"> days</Typography>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={attendanceRate}
                color="success"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AbsentIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Absent Days
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {absentDays}
                <Typography component="span" color="textSecondary"> days</Typography>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={((absentDays / (presentDays + absentDays || 1)) * 100)}
                color="error"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AchievementIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="textSecondary">
                  Attendance Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {`${attendanceRate}%`}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={attendanceRate}
                color="primary"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Table */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Details
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4}}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
        <>
          {Array.isArray(attendanceData?.details) && attendanceData.details.length > 0 ? (
            isMobile ? (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {attendanceData.details.map((record) => {
                  const status = (record.status || '').toString();
                  const statusLower = status.toLowerCase();
                  const chipColor = statusLower === 'present' ? 'success' : statusLower === 'late' ? 'warning' : 'error';

                  return (
                    <Paper key={record.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2">
                            {format(parseISO(record.date), 'MMMM d, yyyy')}
                          </Typography>
                          <Chip label={status || 'Unknown'} color={chipColor} size="small" />
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          <strong>Subject:</strong> {getSubjectLabel(record.subject)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Teacher:</strong> {getTeacherLabel(record.teacher)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Remarks:</strong> {record.remarks || 'N/A'}
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Teacher</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.details.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(parseISO(record.date), 'MMMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            color={record.status === 'Present' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getSubjectLabel(record.subject)}</TableCell>
                        <TableCell>{getTeacherLabel(record.teacher)}</TableCell>
                        <TableCell>{record.remarks || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : (
            <Typography color="textSecondary" sx={{ py: 3 }}>
              No attendance records found for the selected date range.
            </Typography>
          )}
        </>
        )}
      </Paper>
    </Box>
  );
};

export default StudentAttendance;
