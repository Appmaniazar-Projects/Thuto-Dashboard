import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import { 
  getAllSchools, 
  createSchool, 
  updateSchool, 
  deleteSchool,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../../services/superAdminService';

const SuperAdminDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('schools');
  
  // Dialog states
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  // Form states
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    principalName: ''
  });
  
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    schoolId: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schoolsData, adminsData] = await Promise.all([
        getAllSchools(),
        getAllAdmins()
      ]);
      setSchools(schoolsData);
      setAdmins(adminsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSubmit = async () => {
    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, schoolForm);
      } else {
        await createSchool(schoolForm);
      }
      setSchoolDialogOpen(false);
      setEditingSchool(null);
      setSchoolForm({ name: '', address: '', phone: '', email: '', principalName: '' });
      fetchData();
    } catch (err) {
      setError('Failed to save school');
    }
  };

  const handleAdminSubmit = async () => {
    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, adminForm);
      } else {
        await createAdmin(adminForm);
      }
      setAdminDialogOpen(false);
      setEditingAdmin(null);
      setAdminForm({ name: '', email: '', phone: '', schoolId: '', password: '' });
      fetchData();
    } catch (err) {
      setError('Failed to save admin');
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        await deleteSchool(schoolId);
        fetchData();
      } catch (err) {
        setError('Failed to delete school');
      }
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await deleteAdmin(adminId);
        fetchData();
      } catch (err) {
        setError('Failed to delete admin');
      }
    }
  };

  const openSchoolDialog = (school = null) => {
    if (school) {
      setEditingSchool(school);
      setSchoolForm(school);
    } else {
      setEditingSchool(null);
      setSchoolForm({ name: '', address: '', phone: '', email: '', principalName: '' });
    }
    setSchoolDialogOpen(true);
  };

  const openAdminDialog = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setAdminForm({ ...admin, password: '' });
    } else {
      setEditingAdmin(null);
      setAdminForm({ name: '', email: '', phone: '', schoolId: '', password: '' });
    }
    setAdminDialogOpen(true);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <PageTitle 
        title="Super Admin Dashboard" 
        subtitle="Manage schools and administrators across the platform" 
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {schools.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Schools
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {admins.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Admins
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {schools.reduce((total, school) => total + (school.userCount || 0), 0)}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant={activeTab === 'schools' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('schools')}
          startIcon={<SchoolIcon />}
        >
          Schools
        </Button>
        <Button
          variant={activeTab === 'admins' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('admins')}
          startIcon={<AdminIcon />}
        >
          Administrators
        </Button>
      </Box>

      {/* Schools Tab */}
      {activeTab === 'schools' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">School Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openSchoolDialog()}
              >
                Add School
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>School Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Principal</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.address}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{school.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{school.phone}</Typography>
                      </TableCell>
                      <TableCell>{school.principalName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={school.status || 'Active'} 
                          color={school.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openSchoolDialog(school)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteSchool(school.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Admins Tab */}
      {activeTab === 'admins' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Administrator Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openAdminDialog()}
              >
                Add Administrator
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>School</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phone}</TableCell>
                      <TableCell>
                        {schools.find(s => s.id === admin.schoolId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={admin.status || 'Active'} 
                          color={admin.status === 'Active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openAdminDialog(admin)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteAdmin(admin.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* School Dialog */}
      <Dialog open={schoolDialogOpen} onClose={() => setSchoolDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="School Name"
            fullWidth
            variant="outlined"
            value={schoolForm.name}
            onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={schoolForm.address}
            onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={schoolForm.phone}
            onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={schoolForm.email}
            onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Principal Name"
            fullWidth
            variant="outlined"
            value={schoolForm.principalName}
            onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchoolDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSchoolSubmit} variant="contained">
            {editingSchool ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={adminForm.phone}
            onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="School"
            fullWidth
            variant="outlined"
            value={adminForm.schoolId}
            onChange={(e) => setAdminForm({ ...adminForm, schoolId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {schools.map((school) => (
              <MenuItem key={school.id} value={school.id}>
                {school.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label={editingAdmin ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            fullWidth
            variant="outlined"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAdminSubmit} variant="contained">
            {editingAdmin ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDashboard;
