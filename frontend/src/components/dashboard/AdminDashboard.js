import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Divider, MenuItem, TextField, FormControl, InputLabel, Select, List
} from '@mui/material';
import {
  Group as GroupIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Campaign as CampaignIcon,
  FilterAlt as FilterIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import adminService from '../../services/adminService';
import { fetchAllAttendance } from '../../services/attendanceService';
import gradeService from '../../services/gradeService';
import GenderBreakdown from './admin/GenderBreakdown';
import CalendarPanel from './admin/CalendarPanel';
import StatCard from '../common/StatCard';

const ROLES = [
  { value: 'All', label: 'All' },
  { value: 'Teacher', label: 'Teachers' },
  { value: 'Student', label: 'Students' },
  { value: 'Parent', label: 'Parents' }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for data and filters
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [staff, setStaff] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    grade: '',
    gender: '',
    status: '',
    startDate: '',
    endDate: '',
    role: '',
    department: ''
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [studentsRes, attendanceRes, staffRes, gradesRes] = await Promise.all([
          adminService.getUsersByRole('STUDENT'),
          fetchAllAttendance(),
          adminService.getUsersByRole('TEACHER'),
          gradeService.getSchoolGrades()
        ]);
        
        setStudents(studentsRes || []);
        setAttendance(attendanceRes.data || []);
        setStaff(staffRes || []);
        setGrades(gradesRes || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters to data
  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      return (
        (!filters.grade || student.grade === filters.grade) &&
        (!filters.gender || student.gender === filters.gender) &&
        (!filters.status || student.status === filters.status)
      );
    });
  }, [students, filters]);

  const filteredAttendance = React.useMemo(() => {
    return attendance.filter(record => {
      const recordDate = new Date(record.date);
      return (
        (!filters.startDate || recordDate >= new Date(filters.startDate)) &&
        (!filters.endDate || recordDate <= new Date(filters.endDate))
      );
    });
  }, [attendance, filters]);

  const filteredStaff = React.useMemo(() => {
    return staff.filter(staffMember => {
      return (
        (!filters.role || staffMember.role === filters.role) &&
        (!filters.department || staffMember.department === filters.department)
      );
    });
  }, [staff, filters]);

  // Calculate stats
  const stats = React.useMemo(() => {
    // Calculate total students
    const totalStudents = filteredStudents.length;
    
    // Calculate average attendance
    const totalAttendance = filteredAttendance.reduce((sum, record) => sum + record.attendance, 0);
    const averageAttendance = filteredAttendance.length > 0 
      ? Math.round((totalAttendance / filteredAttendance.length) * 100) / 100 
      : 0;
    
    // Calculate total staff
    const totalStaff = filteredStaff.length;
    
    // Calculate system alerts (example: students with low attendance)
    const systemAlerts = filteredStudents.filter(
      student => student.attendanceRate < 80
    ).length;
    
    return {
      totalStudents,
      averageAttendance,
      totalStaff,
      systemAlerts
    };
  }, [filteredStudents, filteredAttendance, filteredStaff]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <Typography>Loading dashboard data...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Administration Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Welcome, {user?.name || 'Admin'}. Here is the school's overview.
        </Typography>
        
        {/* Filter Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Grade"
                name="grade"
                value={filters.grade}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="">All Grades</MenuItem>
                {grades.map(grade => (
                  <MenuItem key={grade.id} value={grade.name}>{grade.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  label="Role"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                >
                  {ROLES.map(role => (
                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon={<SchoolIcon />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Avg. Attendance" 
            value={`${stats.averageAttendance}%`} 
            icon={<AssessmentIcon />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Staff" 
            value={stats.totalStaff} 
            icon={<GroupIcon />} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="System Alerts" 
            value={stats.systemAlerts} 
            icon={<CampaignIcon />} 
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Main Content (Left) */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GenderBreakdown students={filteredStudents} />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 300, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">Enrollment Trends</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar (Right) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Quick Actions</Typography>
            <List dense>
              <Button 
                startIcon={<PersonAddIcon />} 
                fullWidth 
                sx={{ justifyContent: 'flex-start', mb: 1 }}
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
              <Button 
                startIcon={<SettingsIcon />} 
                fullWidth 
                sx={{ justifyContent: 'flex-start', mb: 1 }}
                onClick={() => navigate('/admin/settings')}
              >
                System Settings
              </Button>
              <Button 
                startIcon={<CampaignIcon />} 
                fullWidth 
                sx={{ justifyContent: 'flex-start' }}
                onClick={() => navigate('/announcements/create')}
              >
                Send Announcement
              </Button>
            </List>
          </Paper>
          <CalendarPanel />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
