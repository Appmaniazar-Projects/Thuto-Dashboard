import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  IconButton, 
  Modal, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import { getAttendanceSubmissions, updateAttendanceSubmission } from '../../services/attendanceService';
import PageTitle from '../../components/common/PageTitle';
import { formatDisplayDate } from '../../utils/date';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const AdminAttendancePage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getAttendanceSubmissions();
      setSubmissions(data);
      filterSubmissions(data, selectedMonth, selectedYear);
    } catch (err) {
      setError('Failed to load attendance submissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = (data, month, year) => {
    const filtered = data.filter(sub => {
      const subDate = new Date(sub.date);
      return subDate.getMonth() === month && subDate.getFullYear() === year;
    });
    setFilteredSubmissions(filtered);
  };

  // Generate all 12 months of the year
  const generateMonthOptions = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames.map((name, index) => ({
      value: index,
      label: name
    }));
  };

  // Generate year options (current year and past 5 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const handleMonthChange = (event) => {
    const newMonth = event.target.value;
    setSelectedMonth(newMonth);
    filterSubmissions(submissions, newMonth, selectedYear);
  };

  const handleYearChange = (event) => {
    const newYear = event.target.value;
    setSelectedYear(newYear);
    filterSubmissions(submissions, selectedMonth, newYear);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpen = (submission) => {
    setSelectedSubmission(submission);
    setEditStatus(submission.status);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSubmission(null);
    setEditStatus('');
  };

  const handleSave = async () => {
    if (!selectedSubmission) return;

    try {
      await updateAttendanceSubmission(selectedSubmission.id, { status: editStatus });
      enqueueSnackbar('Attendance updated successfully!', { variant: 'success' });
      handleClose();
      fetchSubmissions(); // Refresh data
    } catch (err) {
      enqueueSnackbar('Failed to update attendance.', { variant: 'error' });
      console.error(err);
    }
  };

  return (
    <Box>
      <PageTitle title="Manage Attendance" subtitle="Review and edit attendance records submitted by teachers." />

      {/* Month and Year Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={handleMonthChange}
                disabled={loading}
              >
                {generateMonthOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={handleYearChange}
                disabled={loading}
              >
                {generateYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredSubmissions.length} of {submissions.length} records
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Class/Grade</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{formatDisplayDate(sub.date)}</TableCell>
                  <TableCell>{sub.teacherName}</TableCell>
                  <TableCell>{sub.grade}</TableCell>
                  <TableCell>{sub.subject}</TableCell>
                  <TableCell>{sub.status}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(sub)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ p: 3, color: 'text.secondary' }}>
                      No attendance records found for {generateMonthOptions()[selectedMonth].label} {selectedYear}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">Edit Attendance</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={editStatus} label="Status" onChange={(e) => setEditStatus(e.target.value)}>
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
              <MenuItem value="Late">Late</MenuItem>
              <MenuItem value="Excused">Excused</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminAttendancePage;
