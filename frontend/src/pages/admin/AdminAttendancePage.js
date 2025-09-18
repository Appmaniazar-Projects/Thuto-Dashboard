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
  Alert 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import { getAttendanceSubmissions, updateAttendanceSubmission } from '../../services/attendanceService';
import PageTitle from '../../components/common/PageTitle';

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
    } catch (err) {
      setError('Failed to load attendance submissions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{new Date(sub.date).toLocaleDateString()}</TableCell>
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
              ))}
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
