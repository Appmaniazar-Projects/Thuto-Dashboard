import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  TextField,
  Stack,
  Paper,
  Chip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getChildAttendance } from '../../services/parentService';
import { formatDisplayDate } from '../../utils/date';

const defaultRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const AttendanceView = ({ childId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => defaultRange().startDate);
  const [endDate, setEndDate] = useState(() => defaultRange().endDate);

  useEffect(() => {
    if (!childId) {
      setAttendance([]);
      return;
    }

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError('');

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          setError('Start date must be before end date.');
          setAttendance([]);
          return;
        }

        const data = await getChildAttendance(childId, {
          startDate,
          endDate,
        });
        setAttendance(data);
      } catch (err) {
        setError('Failed to fetch attendance records.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [childId, endDate, startDate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 200 }}
          disabled={loading}
        />
        <TextField
          label="End"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 200 }}
          disabled={loading}
        />
      </Stack>

      {attendance.length === 0 ? (
        <Typography sx={{ my: 2 }}>No attendance records found for this child.</Typography>
      ) : (
        isMobile ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {attendance.map((record) => {
              const status = (record.status || '').toString();
              const statusLower = status.toLowerCase();
              const chipColor = statusLower === 'present' ? 'success' : statusLower === 'late' ? 'warning' : 'error';

              return (
                <Paper key={record.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Typography variant="subtitle2">
                        {formatDisplayDate(record.date)}
                      </Typography>
                      <Chip label={status || 'Unknown'} color={chipColor} size="small" />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      <strong>Subject:</strong> {record.subject || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Teacher:</strong> {record.teacherName || 'N/A'}
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
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Teacher</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDisplayDate(record.date)}</TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.teacherName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
    </Box>
  );
};

export default AttendanceView;
