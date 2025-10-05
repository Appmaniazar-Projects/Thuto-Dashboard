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
  Input
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  SupervisorAccount as MasterIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import SuperadminManagement from '../../components/superadmin/SuperadminManagement';
import { useAuth } from '../../context/AuthContext';
import { 
  getAllSchools, 
  createSchool, 
  updateSchool, 
  deleteSchool,
  getAllAdmins,
  createAdmin
} from '../../services/superAdminService';
import gradeService from '../../services/gradeService';
import subjectService from '../../services/subjectService';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const SuperAdminDashboard = () => {
  const { isMaster, isProvincialSuperAdmin, currentUser } = useAuth();
  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('schools');
  const [submitting, setSubmitting] = useState(false);
  
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
    province: '',
    subjects: [],
    grades: [],
    logo: ''
  });
  
  const [adminForm, setAdminForm] = useState({
    name: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    schoolId: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
    loadGrades();
    loadSubjects();
  }, []); 

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [schoolsData, adminsData, gradesData] = await Promise.all([
        getAllSchools(), // Pass province filter
        getAllAdmins(), // Get all admins, filter on frontend
        gradeService.getAllGrades()
      ]);
        
      setSchools(schoolsData);
      setAdmins(adminsData);
      setGrades(gradesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    try {
      // For superadmins, try to get all grades first, fall back to school grades if needed
      try {
        const gradesData = await gradeService.getAllGrades();
        setGrades(gradesData);
      } catch (allGradesError) {
        // If getAllGrades fails, try getSchoolGrades as fallback
        console.warn('getAllGrades failed, trying getSchoolGrades:', allGradesError);
        const gradesData = await gradeService.getSchoolGrades();
        setGrades(gradesData);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      // Set empty array as fallback
      setGrades([]);
    }
  };

  const loadSubjects = async () => {
    try {
      // For superadmins, try to get all subjects first, fall back to school subjects if needed
      try {
        const subjectsData = await subjectService.getAllSubjects();
        setSubjects(subjectsData);
      } catch (allSubjectsError) {
        // If getAllSubjects fails, try getSchoolSubjects as fallback
        console.warn('getAllSubjects failed, trying getSchoolSubjects:', allSubjectsError);
        const subjectsData = await subjectService.getSchoolSubjects();
        setSubjects(subjectsData);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      // Set empty array as fallback
      setSubjects([]);
    }
  };

  // School Handlers
  const handleSchoolSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
  
      // Validate required fields
      const requiredFields = ['name', 'address', 'phoneNumber', 'email', 'principalName', 'province'];
      const missingFields = requiredFields.filter(field => !schoolForm[field]?.trim());
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
  
      // Enforce province for provincial superadmins
      if (isProvincialSuperAdmin() && schoolForm.province !== currentUser?.province) {
        setError(`You can only create schools in your assigned province (${currentUser?.province})`);
        return;
      }
  
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(schoolForm.email)) {
        setError('Please enter a valid email address');
        return;
      }
  
      // Phone number format (South African)
      const phoneRegex = /^(\+27|0)[0-9]{9}$/;
      if (!phoneRegex.test(schoolForm.phoneNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid South African phone number (e.g., 0123456789 or +27123456789)');
        return;
      }
  
      // Build submission data
      const formDataToSubmit = { ...schoolForm };
      if (isProvincialSuperAdmin()) {
        formDataToSubmit.province = currentUser?.province;
      }
  
      if (!currentUser?.email) {
        setError('Unable to identify creator. Please log in again.');
        return;
      }
      formDataToSubmit.createdBy = currentUser.email;
  
      // Client-side duplicate check
      const existingSchool = schools.find(school =>
        school.name.toLowerCase() === formDataToSubmit.name.toLowerCase() &&
        school.id !== editingSchool?.id
      );
      if (existingSchool) {
        setError('A school with this name already exists');
        return;
      }
  
      // Submit to backend
      if (editingSchool) {
        await updateSchool(editingSchool.id, formDataToSubmit);
        alert('School updated successfully!');
      } else {
        await createSchool(formDataToSubmit);
        alert(`School created successfully by ${currentUser.email}!`);
      }
  
      // Reset form
      setSchoolDialogOpen(false);
      setEditingSchool(null);
      setSchoolForm({
        name: '',
        address: '',
        phoneNumber: '',
        email: '',
        principalName: '',
        province: isProvincialSuperAdmin() ? currentUser?.province : '',
        subjects: [],
        grades: [],
        logo: ''
      });
      fetchData();
    } catch (err) {
      console.error('School submission error:', err);
  
      if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid school data. Please check all fields.');
      } else if (err.response?.status === 409) {
        setError('A school with this name or email already exists');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create schools in this province');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later or contact support.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message || `Failed to ${editingSchool ? 'update' : 'create'} school. Please try again.`);
      }
    } finally {
      setSubmitting(false);
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
    setError(null);
    setSubmitting(false);
    
    if (school) {
      setEditingSchool(school);
      setSchoolForm({
        ...school,
        subjects: school.subjects || [],
        grades: school.grades || []
      });
    } else {
      setEditingSchool(null);
      
      setSchoolForm({ 
        name: '', 
        address: '', 
        phoneNumber: '', 
        email: '', 
        principalName: '', 
        province: isProvincialSuperAdmin() ? currentUser?.province : '',
        subjects: [], 
        grades: [],
        logo: ''
      });
    }
    setSchoolDialogOpen(true);
  };
  
  // Admin Handlers
  const handleAdminSubmit = async () => {
    try {
      // Validate that selected school belongs to the superadmin's province (for provincial superadmins)
      if (isProvincialSuperAdmin()) {
        const selectedSchool = schools.find(school => school.id === adminForm.schoolId);
        if (selectedSchool && selectedSchool.province !== currentUser?.province) {
          setError('You can only create admins for schools in your assigned province');
          return;
        }
      }
      
      // Add creator's email to the submission data
      const adminDataToSubmit = { ...adminForm };
      if (!currentUser?.email) {
        setError('Unable to identify creator. Please log in again.');
        return;
      }
      adminDataToSubmit.createdBy = currentUser.email;
      
      await createAdmin(adminDataToSubmit);
      setAdminDialogOpen(false);
      setAdminForm({ name: '', lastName: '', email: '', phoneNumber: '', schoolId: '', password: '' });
      fetchData(); // Refresh the admin list
      alert('Admin created successfully!');
    } catch (err) {
      setError('Failed to save admin');
    }
  };

  const openAdminDialog = () => {
    setAdminForm({ name: '', lastName: '', email: '', phoneNumber: '', schoolId: '', password: '' });
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
        {/* Master-only Superadmin Management Tab */}
        {isMaster() && (
          <Button
            variant={activeTab === 'superadmins' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('superadmins')}
            startIcon={<MasterIcon />}
          >
            Superadmin Management
          </Button>
        )}
      </Box>

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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>School</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.lastName || 'N/A'}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.phoneNumber}</TableCell>
                      <TableCell>
                        {schools.find(school => school.id === admin.schoolId)?.name || 'Unknown School'}
                      </TableCell>
                      <TableCell>
                        <Chip label={admin.status || 'Active'} color={admin.status === 'Active' ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => console.log('Edit admin:', admin.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => console.log('Delete admin:', admin.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {admins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No administrators found. Create your first admin using the "Add Administrator" button.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Superadmins Tab */}
      {activeTab === 'superadmins' && isMaster() && (
        <Card>
          <CardContent>
            <SuperadminManagement />
          </CardContent>
        </Card>
      )}

      {/* School Dialog */}
      <Dialog open={schoolDialogOpen} onClose={() => !submitting && setSchoolDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField label="School Name" fullWidth margin="dense" value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} />
          <TextField label="Address" fullWidth margin="dense" multiline rows={2} value={schoolForm.address} onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })} />
          <TextField label="Phone Number" fullWidth margin="dense" value={schoolForm.phoneNumber} onChange={(e) => setSchoolForm({ ...schoolForm, phoneNumber: e.target.value })} />
          <TextField label="Email" type="email" fullWidth margin="dense" value={schoolForm.email} onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })} />
          <TextField label="Principal Name" fullWidth margin="dense" value={schoolForm.principalName} onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })} />
          <TextField
            select
            fullWidth
            margin="normal"
            label="Province"
            name="province"
            value={schoolForm.province}
            onChange={(e) => setSchoolForm({ ...schoolForm, province: e.target.value })}
            required
          >
            {PROVINCES.map((province) => (
              <MenuItem key={province} value={province}>
                {province}
              </MenuItem>
            ))}
          </TextField>
          <FormControl fullWidth margin="dense">
            <InputLabel id="subjects-label">Subjects</InputLabel>
            <Select
              labelId="subjects-label"
              multiple
              value={schoolForm.subjects}
              onChange={(e) => setSchoolForm({ ...schoolForm, subjects: e.target.value })}
              input={<Input />}
              renderValue={(selected) => selected.map(s => s.name || s).join(', ')}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  <Checkbox checked={schoolForm.subjects.includes(subject.id)} />
                  <ListItemText primary={subject.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel id="grades-label">Grades</InputLabel>
            <Select
              labelId="grades-label"
              multiple
              value={schoolForm.grades}
              onChange={(e) => setSchoolForm({ ...schoolForm, grades: e.target.value })}
              input={<Input />}
              renderValue={(selected) => selected.map(g => g.name || g).join(', ')}
            >
              {grades.map((grade) => (
                <MenuItem key={grade.id} value={grade.id}>
                  <Checkbox checked={schoolForm.grades.includes(grade.id)} />
                  <ListItemText primary={grade.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchoolDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchoolSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : (editingSchool ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Administrator</DialogTitle>
        <DialogContent>
          <TextField label="First Name" fullWidth margin="dense" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
          <TextField label="Last Name" fullWidth margin="dense" value={adminForm.lastName} onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })} />
          <TextField label="Email" type="email" fullWidth margin="dense" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
          <TextField label="Phone Number" fullWidth margin="dense" value={adminForm.phoneNumber} onChange={(e) => setAdminForm({ ...adminForm, phoneNumber: e.target.value })} />
          <TextField select label="School" fullWidth margin="dense" value={adminForm.schoolId} onChange={(e) => setAdminForm({ ...adminForm, schoolId: e.target.value })}>
            {schools
              .filter(school => 
                !isProvincialSuperAdmin() || school.province === currentUser?.province
              )
              .map((school) => (
                <MenuItem key={school.id} value={school.id}>
                  {school.name} {isProvincialSuperAdmin() ? '' : `(${school.province})`}
                </MenuItem>
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
