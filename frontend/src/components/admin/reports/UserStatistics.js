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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import adminService from '../../../services/adminService';
import { formatDisplayDate } from '../../../utils/date';
import StatCard from '../../common/StatCard';
import { People, PersonAdd, TrendingUp, AccountCircle } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const truncateText = (value, maxLength) => {
  const text = (value ?? '').toString();
  if (!maxLength || text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`;
};

const UserStatistics = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('30');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getUserCreatedAt = (user) => {
    const raw = user?.createdAt ?? user?.created_at ?? user?.createdOn ?? user?.createdDate ?? user?.registrationDate;
    if (!raw) return null;
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const isUserActive = (user) => {
    const status = (user?.status ?? user?.accountStatus ?? user?.state ?? '').toString().trim().toLowerCase();
    if (status) {
      return status === 'active' || status === 'enabled' || status === 'approved';
    }
    if (typeof user?.enabled === 'boolean') return user.enabled;
    if (typeof user?.isActive === 'boolean') return user.isActive;
    // If backend does not provide a status, treat users as active by default.
    return true;
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const usersResponse = await adminService.getAllUsers();
      setAllUsers(Array.isArray(usersResponse) ? usersResponse : []);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Unable to load user statistics. Please try again later.');
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationTrends = () => {
    const days = parseInt(timeFilter);
    const now = new Date();
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const registrations = allUsers.filter(user => {
        const createdAt = getUserCreatedAt(user);
        if (!createdAt) return false;
        const userDate = createdAt.toISOString().split('T')[0];
        return userDate === dateStr;
      }).length;
      
      trends.push({
        date: formatDisplayDate(date),
        registrations
      });
    }
    
    return trends;
  };

  const getDetailedStats = () => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const recent30 = allUsers.filter(user => 
      getUserCreatedAt(user) && getUserCreatedAt(user) >= last30Days
    ).length;
    
    const recent7 = allUsers.filter(user => 
      getUserCreatedAt(user) && getUserCreatedAt(user) >= last7Days
    ).length;
    
    const activeUsers = allUsers.filter((user) => isUserActive(user)).length;
    
    return {
      newUsersLast30Days: recent30,
      newUsersLast7Days: recent7,
      activeUsers,
      totalUsers: allUsers.length
    };
  };

  const getRoleDistribution = () => {
    const roleCounts = {};
    allUsers.forEach(user => {
      const role = user.role || 'unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count
    }));
  };

  const getRecentUsers = () => {
    return allUsers
      .map((u) => ({ user: u, createdAt: getUserCreatedAt(u) }))
      .filter((row) => !!row.createdAt)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => row.user)
      .slice(0, 10);
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

  const detailedStats = getDetailedStats();
  const roleDistribution = getRoleDistribution();
  const registrationTrends = getRegistrationTrends();
  const recentUsers = getRecentUsers();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detailed User Analytics
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        In-depth user registration and activity insights
      </Typography>
      
      {/* Detailed Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="New Users (30 days)" 
            value={detailedStats.newUsersLast30Days} 
            icon={<PersonAdd />} 
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="New Users (7 days)" 
            value={detailedStats.newUsersLast7Days} 
            icon={<TrendingUp />} 
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Users" 
            value={detailedStats.activeUsers} 
            icon={<AccountCircle />} 
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Registered" 
            value={detailedStats.totalUsers} 
            icon={<People />} 
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  mb: 2
                }}
              >
                <Typography variant="h6">
                  Registration Trends
                </Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={timeFilter}
                    label="Time Period"
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    <MenuItem value="7">Last 7 days</MenuItem>
                    <MenuItem value="30">Last 30 days</MenuItem>
                    <MenuItem value="90">Last 90 days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
                <LineChart
                  data={registrationTrends}
                  margin={{ top: 10, right: 20, left: 0, bottom: isMobile ? 16 : 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    interval={isMobile ? 'preserveStartEnd' : 0}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickMargin={8}
                    angle={isMobile ? 0 : -20}
                    textAnchor={isMobile ? 'middle' : 'end'}
                    height={isMobile ? 50 : 70}
                    tickFormatter={(value) => truncateText(value, isMobile ? 8 : 12)}
                  />
                  <YAxis />
                  <Tooltip />
                  {!isMobile && <Legend />}
                  <Line type="monotone" dataKey="registrations" stroke="#1976d2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Role Distribution
              </Typography>
              {roleDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={isMobile ? 60 : 75}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={isMobile ? 56 : 36}
                      wrapperStyle={{ fontSize: isMobile ? 11 : 12, lineHeight: 1.2 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No role data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Registrations Table */}
      {recentUsers.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Registrations
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registration Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user, index) => (
                    <TableRow key={user.id || index}>
                      <TableCell>{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {user.role || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {(user.status || user.accountStatus || user.state) ? (user.status || user.accountStatus || user.state) : (isUserActive(user) ? 'active' : 'inactive')}
                      </TableCell>
                      <TableCell>
                        {getUserCreatedAt(user) ? formatDisplayDate(getUserCreatedAt(user)) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserStatistics;
