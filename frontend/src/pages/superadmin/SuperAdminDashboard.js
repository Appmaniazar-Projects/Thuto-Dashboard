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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  Input,
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
  createAdmin
} from '../../services/superAdminService';

const subjects = [
  { id: 'eng', name: 'English' },
  { id: 'afr', name: 'Afrikaans' },
  { id: 'math', name: 'Mathematics' },
  { id: 'mathlit', name: 'Mathematical Literacy' },
  { id: 'phy', name: 'Physical Sciences' },
  { id: 'chem', name: 'Chemistry' },
  { id: 'bio', name: 'Biology' },
  { id: 'geo', name: 'Geography' },
  { id: 'his', name: 'History' },
  { id: 'eco', name: 'Economics' },
  { id: 'bus', name: 'Business Studies' },
  { id: 'acc', name: 'Accounting' },
  { id: 'life', name: 'Life Orientation' },
  { id: 'lifeskills', name: 'Life Skills' },
  { id: 'science', name: 'Natural Science' },
  { id: 'tech', name: 'Technology' },
  { id: 'it', name: 'Information Technology' },
  { id: 'art', name: 'Arts and Culture' },
  { id: 'pe', name: 'Physical Education' },
  { id: 'music', name: 'Music' },
  { id: 'dance', name: 'Dance' }
];

const grades = [
  { id: 'grade_1', name: 'Grade 1' },
  { id: 'grade_2', name: 'Grade 2' },
  { id: 'grade_3', name: 'Grade 3' },
  { id: 'grade_4', name: 'Grade 4' },
  { id: 'grade_5', name: 'Grade 5' },
  { id: 'grade_6', name: 'Grade 6' },
  { id: 'grade_7', name: 'Grade 7' },
  { id: 'grade_8', name: 'Grade 8' },
  { id: 'grade_9', name: 'Grade 9' },
  { id: 'grade_10', name: 'Grade 10' },
  { id: 'grade_11', name: 'Grade 11' },
  { id: 'grade_12', name: 'Grade 12' }
];

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
  
  // Form states
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    principalName: '',
    subjects: [],  // Array of selected subject values
    grades: []     // Array of selected grade values
  });
  
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    schoolId: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const schoolsData = await getAllSchools();
      setSchools(schoolsData);
      setAdmins([]); // Admin fetching not supported yet
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // School Handlers
  const handleSchoolSubmit = async () => {
    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, schoolForm);
      } else {
        await createSchool(schoolForm);
      }
      setSchoolDialogOpen(false);
      setEditingSchool(null);
      setSchoolForm({ name: '', address: '', phoneNumber: '', email: '', principalName: '', subjects: [], grades: [] });
      fetchData();
    } catch (err) {
      setError('Failed to save school');
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

  const openSchoolDialog = (school = null) => {
    if (school) {
      setEditingSchool(school);
      setSchoolForm({
        ...school,
        subjects: school.subjects.map(s => ({ id: s.id, name: s.name })),
        grades: school.grades.map(g => ({ id: g.id, name: g.name }))
      });
    } else {
      setEditingSchool(null);
      setSchoolForm({ name: '', address: '', phoneNumber: '', email: '', principalName: '', subjects: [], grades: []});
    }
    setSchoolDialogOpen(true);
  };

  // Admin Handlers
  const handleAdminSubmit = async () => {
    try {
      await createAdmin(adminForm);
      setAdminDialogOpen(false);
      setAdminForm({ name: '', email: '', phoneNumber: '', schoolId: '', password: '' });
      alert('Admin created! (Fetching admin list not implemented yet)');
    } catch (err) {
      setError('Failed to save admin');
    }
  };

  const openAdminDialog = () => {
    setAdminForm({ name: '', email: '', phoneNumber: '', schoolId: '', password: '' });
    setAdminDialogOpen(true);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );

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
                  <Typography variant="h4">{schools.length}</Typography>
                  <Typography color="text.secondary">Total Schools</Typography>
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
                  <Typography variant="h4">{admins.length}</Typography>
                  <Typography color="text.secondary">Total Admins</Typography>
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
                  <Typography variant="h4">{schools.reduce((sum, s) => sum + (s.userCount || 0), 0)}</Typography>
                  <Typography color="text.secondary">Total Users</Typography>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">School Management</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => openSchoolDialog()}>
                Add School
              </Button>
            </Box>
            <TableContainer component={Paper}>
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
                        <Typography variant="body2" color="text.secondary">{school.phoneNumber}</Typography>
                      </TableCell>
                      <TableCell>{school.principalName}</TableCell>
                      <TableCell>
                        <Chip label={school.status || 'Active'} color={school.status === 'Active' ? 'success' : 'default'} size="small" />
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Administrator Management</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAdminDialog}>
                Add Administrator
              </Button>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Admin listing not supported yet. You can create admins.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* School Dialog */}
      <Dialog open={schoolDialogOpen} onClose={() => setSchoolDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
        <DialogContent>
          <TextField label="School Name" fullWidth margin="dense" value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} />
          <TextField label="Address" fullWidth margin="dense" multiline rows={2} value={schoolForm.address} onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })} />
          <TextField label="Phone Number" fullWidth margin="dense" value={schoolForm.phoneNumber} onChange={(e) => setSchoolForm({ ...schoolForm, phoneNumber: e.target.value })} />
          <TextField label="Email" type="email" fullWidth margin="dense" value={schoolForm.email} onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })} />
          <TextField label="Principal Name" fullWidth margin="dense" value={schoolForm.principalName} onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })} />
          <FormControl fullWidth margin="dense">
          <InputLabel id="subjects-label">Subjects</InputLabel>
          <Select
            labelId="subjects-label"
            multiple
            value={schoolForm.subjects}
            onChange={(e) => setSchoolForm({ ...schoolForm, subjects: e.target.value })}
            input={<Input />}
            renderValue={(selected) => selected.map(s => s.name).join(', ')}
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject}>
                <Checkbox checked={schoolForm.subjects.some(s => s.id === subject.id)} />
                <ListItemText primary={subject.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Grades multi-select */}
        <FormControl fullWidth margin="dense">
          <InputLabel id="grades-label">Grades</InputLabel>
          <Select
            labelId="grades-label"
            multiple
            value={schoolForm.grades}
            onChange={(e) => setSchoolForm({ ...schoolForm, grades: e.target.value })}
            input={<Input />}
            renderValue={(selected) => selected.map(g => g.name).join(', ')}
          >
            {grades.map((grade) => (
              <MenuItem key={grade.id} value={grade}>
                <Checkbox checked={schoolForm.grades.some(g => g.id === grade.id)} />
                <ListItemText primary={grade.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchoolDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSchoolSubmit} variant="contained">{editingSchool ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Administrator</DialogTitle>
        <DialogContent>
          <TextField label="Full Name" fullWidth margin="dense" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
          <TextField label="Email" type="email" fullWidth margin="dense" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
          <TextField label="Phone Number" fullWidth margin="dense" value={adminForm.phoneNumber} onChange={(e) => setAdminForm({ ...adminForm, phoneNumber: e.target.value })} />
          <TextField select label="School" fullWidth margin="dense" value={adminForm.schoolId} onChange={(e) => setAdminForm({ ...adminForm, schoolId: e.target.value })}>
            {schools.map((school) => (
              <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Password" type="password" fullWidth margin="dense" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAdminSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDashboard;
