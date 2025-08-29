import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAttendanceSubmissions } from '../../../services/adminService';
import StatCard from '../../common/StatCard';
import { Assignment, CheckCircle, Schedule, Cancel } from '@mui/icons-material';

const COLORS = ['#4caf50', '#ff9800', '#f44336'];
const STATUS_COLORS = {
  approved: '#4caf50',
  pending: '#ff9800',
  rejected: '#f44336'
};

const AttendanceSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAttendanceSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch attendance submissions:', err);
      setError('Unable to load attendance submissions. Please try again later.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    if (statusFilter === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(sub => sub.status === statusFilter));
    }
  };

  const getSubmissionStats = () => {
    const stats = {
      total: submissions.length,
      approved: submissions.filter(s => s.status === 'approved').length,
      pending: submissions.filter(s => s.status === 'pending').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    };
    
    return stats;
  };

  const getStatusDistribution = () => {
    const stats = getSubmissionStats();
    return [
      { name: 'Approved', value: stats.approved, color: STATUS_COLORS.approved },
      { name: 'Pending', value: stats.pending, color: STATUS_COLORS.pending },
      { name: 'Rejected', value: stats.rejected, color: STATUS_COLORS.rejected },
    ].filter(item => item.value > 0);
  };

  const getSubmissionsByTeacher = () => {
    const teacherStats = {};
    submissions.forEach(sub => {
      const teacher = sub.teacherName || 'Unknown';
      if (!teacherStats[teacher]) {
        teacherStats[teacher] = { approved: 0, pending: 0, rejected: 0 };
      }
      teacherStats[teacher][sub.status] = (teacherStats[teacher][sub.status] || 0) + 1;
    });

    return Object.entries(teacherStats).map(([teacher, stats]) => ({
      teacher,
      ...stats,
      total: stats.approved + stats.pending + stats.rejected
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const stats = getSubmissionStats();
  const statusDistribution = getStatusDistribution();
  const teacherData = getSubmissionsByTeacher();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Submissions Report
      </Typography>
      
      {/* Summary Cards using StatCard component */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Submissions" 
            value={stats.total} 
            icon={<Assignment />} 
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Approved" 
            value={stats.approved} 
            icon={<CheckCircle />} 
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pending Review" 
            value={stats.pending} 
            icon={<Schedule />} 
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Rejected" 
            value={stats.rejected} 
            icon={<Cancel />} 
            color="error"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Submission Status Distribution
              </Typography>
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No submission data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Submissions by Teacher
              </Typography>
              {teacherData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teacherData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="teacher" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No teacher data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submissions Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Recent Submissions
            </Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {filteredSubmissions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Teacher</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubmissions.slice(0, 20).map((submission, index) => (
                    <TableRow key={submission.submissionId || index}>
                      <TableCell>{submission.teacherName || 'N/A'}</TableCell>
                      <TableCell>{submission.className || 'N/A'}</TableCell>
                      <TableCell>
                        {submission.date ? new Date(submission.date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={submission.status || 'unknown'} 
                          color={
                            submission.status === 'approved' ? 'success' :
                            submission.status === 'pending' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No submissions found for the selected filter.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceSubmissions;
