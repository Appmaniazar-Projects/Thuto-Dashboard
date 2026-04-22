import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
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
  createAdmin,
  updateAdmin,
  deleteAdmin,
  bulkUploadSchools
} from '../../services/superAdminService';
import regionService from '../../services/regionService';

const SuperAdminDashboard = () => {
  const {
    isMaster,
    isNationalSuperAdmin,
    isRegionalSuperAdmin,
    isProvincialSuperAdmin,
    currentUser
  } = useAuth();

  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('schools');
  const [submitting, setSubmitting] = useState(false);

  // Resolved human-readable names for currentUser province/region
  // (currentUser stores IDs e.g. province: "9", region: "50")
  const [currentUserProvinceName, setCurrentUserProvinceName] = useState('');
  const [currentUserRegionName, setCurrentUserRegionName] = useState('');

  // Dialog open/close
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // School form
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    principalName: '',
    province: '',     // human-readable name sent to backend
    provinceId: null, // numeric ID used only for loading regions dropdown
    regionalId: null, // numeric ID sent to backend
    region: '',       // human-readable name (display only)
    logo: ''
  });

  const [schoolFormRegions, setSchoolFormRegions] = useState([]);
  const [loadingSchoolFormRegions, setLoadingSchoolFormRegions] = useState(false);
  const [schoolFormProvinces, setSchoolFormProvinces] = useState([]);
  const [loadingSchoolFormProvinces, setLoadingSchoolFormProvinces] = useState(false);

  // Admin form
  const [adminForm, setAdminForm] = useState({
    name: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    schoolId: '',
    password: '',
    province: '',
    region: ''
  });

  // Bulk upload state
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────
  const normalizeArray = (val) => {
    if (Array.isArray(val)) return val;
    if (!val || typeof val !== 'object') return [];
    for (const key of Object.keys(val)) {
      if (Array.isArray(val[key])) return val[key];
    }
    return [];
  };

  const safeFilter = (arr, fn) => (Array.isArray(arr) ? arr : []).filter(fn);

  // ─────────────────────────────────────────────────────────────
  // Resolve currentUser province/region IDs to human-readable names
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const resolveUserLocation = async () => {
      if (!currentUser?.province) return;
      try {
        const provinces = await regionService.getAllProvinces();
        const matched = normalizeArray(provinces).find(p =>
          String(typeof p === 'object' ? p.id : p) === String(currentUser.province)
        );
        const provinceName = typeof matched === 'object' ? matched.name : (matched || '');
        setCurrentUserProvinceName(provinceName);

        if (currentUser?.region) {
          const regions = await regionService.getRegionsByProvinceId(currentUser.province);
          const matchedRegion = normalizeArray(regions).find(r =>
            String(r.id) === String(currentUser.region)
          );
          setCurrentUserRegionName(matchedRegion?.name || '');
        }
      } catch (e) {
        console.error('Failed to resolve user location names:', e);
      }
    };
    resolveUserLocation();
  }, [currentUser]);

  // Resolve province/region names on demand (fallback at submit time)
  const resolveLocationNames = async () => {
    try {
      let provinceName = currentUserProvinceName;
      let regionName = currentUserRegionName;

      if (!provinceName && currentUser?.province) {
        const provinces = await regionService.getAllProvinces();
        const match = normalizeArray(provinces).find(p =>
          String(typeof p === 'object' ? p.id : p) === String(currentUser.province)
        );
        provinceName = typeof match === 'object' ? match.name : (match || '');
        setCurrentUserProvinceName(provinceName);
      }

      if (!regionName && currentUser?.region) {
        const regions = await regionService.getRegionsByProvinceId(currentUser.province);
        const match = normalizeArray(regions).find(r => String(r.id) === String(currentUser.region));
        regionName = match?.name || '';
        setCurrentUserRegionName(regionName);
      }

      return { provinceName, regionName };
    } catch (e) {
      console.error('Failed to resolve location names at submit time:', e);
      return { provinceName: currentUserProvinceName, regionName: currentUserRegionName };
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Load regions for the school form whenever provinceId changes
  useEffect(() => {
    const load = async () => {
      const idToLoad =
        schoolForm.provinceId ||
        (isProvincialSuperAdmin() ? currentUser?.province : null);

      if (!idToLoad) { setSchoolFormRegions([]); return; }

      setLoadingSchoolFormRegions(true);
      try {
        const regions = await regionService.getRegionsByProvinceId(idToLoad);
        setSchoolFormRegions(normalizeArray(regions));
      } catch { setSchoolFormRegions([]); }
      finally { setLoadingSchoolFormRegions(false); }
    };
    load();
  }, [schoolForm.provinceId, schoolDialogOpen]);

  // Load provinces when school dialog opens
  useEffect(() => {
    if (!schoolDialogOpen) return;
    const load = async () => {
      setLoadingSchoolFormProvinces(true);
      try {
        const provinces = await regionService.getAllProvinces();
        setSchoolFormProvinces(normalizeArray(provinces));
      } catch { setSchoolFormProvinces([]); }
      finally { setLoadingSchoolFormProvinces(false); }
    };
    load();
  }, [schoolDialogOpen]);

  // ─────────────────────────────────────────────────────────────
  // Data fetching — backend handles all role-based filtering
  // ─────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const createdBy = currentUser?.email;
      if (!createdBy) { setError('Unable to identify user. Please log in again.'); return; }

      const [schoolsData, adminsData] = await Promise.all([
        getAllSchools(createdBy),
        getAllAdmins('admin', createdBy)
      ]);

      setSchools(normalizeArray(schoolsData));
      setAdmins(normalizeArray(adminsData));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load data'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // School handlers
  // ─────────────────────────────────────────────────────────────
  const openSchoolDialog = (school = null) => {
    setError(null);
    setSubmitting(false);

    if (school) {
      const matchedProv = schoolFormProvinces.find(p =>
        (typeof p === 'object' ? p.name : p) === school.province
      );
      setEditingSchool(school);
      setSchoolForm({
        name: school.name || '',
        address: school.address || '',
        phoneNumber: school.phoneNumber || '',
        email: school.email || '',
        principalName: school.principalName || '',
        province: school.province || '',
        provinceId: matchedProv?.id || null,
        regionalId: school.regionalId || school.regionId || null,
        region: school.region || '',
        logo: school.logo || ''
      });
    } else {
      setEditingSchool(null);
      setSchoolForm({
        name: '',
        address: '',
        phoneNumber: '',
        email: '',
        principalName: '',
        province: isProvincialSuperAdmin() ? currentUserProvinceName : '',
        provinceId: isProvincialSuperAdmin() ? currentUser?.province || null : null,
        regionalId: isRegionalSuperAdmin() ? Number(currentUser?.region) || null : null,
        region: isRegionalSuperAdmin() ? currentUserRegionName : '',
        logo: ''
      });
      setSchoolFormRegions([]);
    }

    setSchoolDialogOpen(true);
  };

  const handleSchoolSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const requiredFields = ['name', 'address', 'phoneNumber', 'email', 'principalName'];
      if (isNationalSuperAdmin()) requiredFields.push('province');
      if (isNationalSuperAdmin() || isProvincialSuperAdmin()) requiredFields.push('regionalId');

      const missingFields = requiredFields.filter(field => {
        const v = schoolForm[field];
        if (v === null || v === undefined || v === '') return true;
        if (typeof v === 'object') return !v.name && !v.id;
        return !v.toString().trim();
      });

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolForm.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!/^(\+27|0)[0-9]{9}$/.test(schoolForm.phoneNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid South African phone number (e.g. 0123456789 or +27123456789)');
        return;
      }

      const payload = { ...schoolForm };
      delete payload.provinceId;

      if (isProvincialSuperAdmin() || isRegionalSuperAdmin()) {
        const { provinceName, regionName } = await resolveLocationNames();
        if (isProvincialSuperAdmin()) {
          payload.province = provinceName || '';
        }
        if (isRegionalSuperAdmin()) {
          payload.province = provinceName || '';
          payload.region = regionName || '';
          payload.regionalId = Number(currentUser?.region) || null;
        }
      }

      payload.createdBy = currentUser.email;

      if (editingSchool) {
        await updateSchool(editingSchool.id, payload, currentUser.email);
        alert('School updated successfully!');
      } else {
        await createSchool(payload);
        alert('School created successfully!');
      }

      setSchoolDialogOpen(false);
      setEditingSchool(null);
      setSchoolForm({
        name: '', address: '', phoneNumber: '', email: '',
        principalName: '', province: '', provinceId: null,
        regionalId: null, region: '', logo: ''
      });
      fetchData();
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) setError(err.response.data?.message || 'Invalid school data.');
      else if (status === 409) setError('A school with this name or email already exists.');
      else if (status === 403) setError('You do not have permission to create schools here.');
      else if (status === 500) setError('Server error. Please try again later.');
      else setError(err.message || `Failed to ${editingSchool ? 'update' : 'create'} school.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    try {
      await deleteSchool(schoolId);
      fetchData();
      alert('School deleted successfully!');
    } catch { setError('Failed to delete school'); }
  };

  // ─────────────────────────────────────────────────────────────
  // Admin handlers
  // ─────────────────────────────────────────────────────────────
  const openAdminDialog = (admin = null) => {
    setError(null);
    setSubmitting(false);
    if (admin) {
      setEditingAdmin({ ...admin, id: admin.id || admin.email });
      setAdminForm({
        name: admin.name || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        phoneNumber: admin.phoneNumber || '',
        schoolId: admin.schoolId || admin.school?.id || '',
        password: '',
        province: admin.province || '',
        region: admin.region || ''
      });
    } else {
      setEditingAdmin(null);
      setAdminForm({
        name: '', lastName: '', email: '', phoneNumber: '',
        schoolId: '', password: '', province: '', region: ''
      });
    }
    setAdminDialogOpen(true);
  };

  const handleAdminDialogClose = () => {
    setAdminDialogOpen(false);
    setEditingAdmin(null);
    setError(null);
    setAdminForm({
      name: '', lastName: '', email: '', phoneNumber: '',
      schoolId: '', password: '', province: '', region: ''
    });
  };

  const handleAdminSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const required = ['name', 'lastName', 'email', 'phoneNumber', 'schoolId'];
      if (!editingAdmin) required.push('password');
      const missing = required.filter(f => !String(adminForm[f] || '').trim());
      if (missing.length) { setError(`Please fill in: ${missing.join(', ')}`); return; }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email.trim())) {
        setError('Please enter a valid email address'); return;
      }
      if (!/^(\+27|0)[0-9]{9}$/.test(adminForm.phoneNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid South African phone number'); return;
      }

      const selectedSchool = schools.find(s => s.id === adminForm.schoolId);

      if (isProvincialSuperAdmin() && selectedSchool?.province !== currentUserProvinceName) {
        setError(`You can only assign admins to schools in ${currentUserProvinceName}`); return;
      }

      const province = selectedSchool?.province || currentUserProvinceName || adminForm.province || '';
      const region = selectedSchool?.region || currentUserRegionName || adminForm.region || '';

      const payload = {
        ...adminForm,
        name: adminForm.name.trim(),
        lastName: adminForm.lastName.trim(),
        email: adminForm.email.trim(),
        phoneNumber: adminForm.phoneNumber.trim(),
        province,
        region,
        createdBy: currentUser.email,
        updatedBy: currentUser.email
      };
      if (!editingAdmin || adminForm.password) payload.password = adminForm.password;

      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, { ...payload, id: editingAdmin.id });
        alert('Administrator updated successfully!');
      } else {
        await createAdmin(payload);
        alert('Administrator created successfully!');
      }

      setAdminDialogOpen(false);
      setEditingAdmin(null);
      setAdminForm({
        name: '', lastName: '', email: '', phoneNumber: '',
        schoolId: '', password: '', province: '', region: ''
      });
      fetchData();
    } catch (err) {
      setError(err.message || `Failed to ${editingAdmin ? 'update' : 'create'} administrator.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this administrator?')) return;
    try {
      await deleteAdmin(adminId);
      fetchData();
      alert('Administrator deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete administrator.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Bulk upload handlers
  // ─────────────────────────────────────────────────────────────
  const MAX_FILE_SIZE_MB = 10;

  const acceptFile = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setError(null);
    setBulkUploadFile(file);
  };

  const handleBulkUploadFileChange = (e) => acceptFile(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      acceptFile(file);
    } else {
      setError('Please upload a CSV or Excel file');
    }
  };

  const handleBulkUploadSubmit = async () => {
    if (!bulkUploadFile) { setError('No file selected'); return; }
    try {
      setSubmitting(true);
      setError(null);
      const createdBy = currentUser?.email;
      if (!createdBy) { setError('Unable to identify creator.'); return; }

      const formData = new FormData();
      formData.append('file', bulkUploadFile);
      formData.append('createdBy', createdBy);

      const results = await bulkUploadSchools(formData);
      const ok = normalizeArray(results).filter(r => r.success).length;
      const fail = normalizeArray(results).filter(r => !r.success).length;
      alert(`Bulk upload done:\n✅ ${ok} created\n❌ ${fail} failed`);
      setBulkUploadDialogOpen(false);
      setBulkUploadFile(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Bulk upload failed');
    } finally { setSubmitting(false); }
  };

  const downloadBulkUploadTemplate = () => {
    const csv = [
      ['name', 'address', 'phoneNumber', 'email', 'principalName', 'province', 'region'],
      ['Example Primary School', '123 Main St', '0211234567', 'info@example.edu.za', 'Mrs Smith', 'Western Cape', 'Cape Winelands District Municipality'],
      ['Sample High School', '456 Oak Ave', '0119876543', 'admin@sample.edu.za', 'Mr Johnson', 'Mpumalanga', 'Gert Sibande District Municipality']
    ].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'school_bulk_upload_template.csv';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ─────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────
  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <Box>
      <PageTitle
        title="Super Admin Dashboard"
        subtitle="Manage schools and administrators across the platform"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tab navigation */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant={activeTab === 'schools' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('schools')}
          startIcon={<SchoolIcon />}
        >Schools</Button>
        <Button
          variant={activeTab === 'admins' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('admins')}
          startIcon={<AdminIcon />}
        >Administrators</Button>
        {isMaster() && (
          <Button
            variant={activeTab === 'superadmins' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('superadmins')}
            startIcon={<MasterIcon />}
          >Superadmin Management</Button>
        )}
      </Box>

      {/* Stats cards */}
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
                  <Typography color="text.secondary">Total Administrators</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Schools tab */}
      {activeTab === 'schools' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">School Management</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {isNationalSuperAdmin() && (
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setBulkUploadDialogOpen(true)}>
                    Bulk Upload
                  </Button>
                )}
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => openSchoolDialog()}>
                  Add School
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>School Name</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Principal</TableCell>
                    <TableCell>Province</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeFilter(schools, s => s).map((school, i) => (
                    <TableRow key={school.id || `school-${i}`}>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.address}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{school.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{school.phoneNumber}</Typography>
                      </TableCell>
                      <TableCell>{school.principalName}</TableCell>
                      <TableCell>{school.province || 'N/A'}</TableCell>
                      <TableCell>{school.region || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={safeFilter(admins, a => a.schoolId === school.id).length > 0 ? 'Active' : 'Pre-populated'}
                          color={safeFilter(admins, a => a.schoolId === school.id).length > 0 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openSchoolDialog(school)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDeleteSchool(school.id)} color="error"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {schools.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary">No schools found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Admins tab */}
      {activeTab === 'admins' && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Administrator Management</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAdminDialog(null)}>
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
                    <TableCell>Phone</TableCell>
                    <TableCell>School</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeFilter(admins, a => a).map((admin, i) => {
                    const school = schools.find(s => s.id === (admin.schoolId || admin.school?.id));
                    const schoolName = school?.name || admin.school?.name || admin.schoolName || 'Unknown School';
                    return (
                      <TableRow key={admin.id || `admin-${i}`}>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>{admin.lastName || 'N/A'}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.phoneNumber}</TableCell>
                        <TableCell>{schoolName}</TableCell>
                        <TableCell>
                          <Chip label="Active" color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => openAdminDialog(admin)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDeleteAdmin(admin.id || admin.email)} color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {admins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No administrators found. Click "Add Administrator" to create one.
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

      {/* Superadmin management tab (Master only) */}
      {activeTab === 'superadmins' && isMaster() && (
        <SuperadminManagement />
      )}

      {/* School Dialog */}
      <Dialog
        open={schoolDialogOpen}
        onClose={() => !submitting && setSchoolDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            <TextField
              label="School Name" fullWidth margin="dense" required
              value={schoolForm.name}
              onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
            />
            <TextField
              label="Address" fullWidth margin="dense" multiline rows={2}
              value={schoolForm.address}
              onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Phone Number" fullWidth margin="dense" required
                value={schoolForm.phoneNumber}
                onChange={(e) => setSchoolForm({ ...schoolForm, phoneNumber: e.target.value })}
              />
              <TextField
                label="Email" type="email" fullWidth margin="dense" required
                value={schoolForm.email}
                onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
              />
            </Box>
            <TextField
              label="Principal Name" fullWidth margin="dense" required
              value={schoolForm.principalName}
              onChange={(e) => setSchoolForm({ ...schoolForm, principalName: e.target.value })}
            />

            {/* Province — National selects, Provincial reads only, Regional hidden */}
            {isNationalSuperAdmin() && (
              <TextField
                select fullWidth margin="dense" required
                label="Province"
                value={schoolForm.provinceId || ''}
                onChange={(e) => {
                  const selected = schoolFormProvinces.find(p =>
                    (typeof p === 'object' ? p.id : p) === e.target.value
                  );
                  setSchoolForm({
                    ...schoolForm,
                    province: typeof selected === 'object' ? selected.name : String(selected || ''),
                    provinceId: e.target.value,
                    regionalId: null,
                    region: ''
                  });
                }}
                disabled={loadingSchoolFormProvinces}
              >
                <MenuItem value=""><em>Select Province</em></MenuItem>
                {safeFilter(schoolFormProvinces, () => true).map((p) => {
                  const v = typeof p === 'object' ? p.id : p;
                  const l = typeof p === 'object' ? p.name : p;
                  return <MenuItem key={String(v)} value={v}>{l}</MenuItem>;
                })}
              </TextField>
            )}

            {isProvincialSuperAdmin() && (
              <TextField
                fullWidth margin="dense" label="Province"
                value={currentUserProvinceName || ''}
                disabled
                helperText="Your assigned province"
              />
            )}

            {/* Region — National selects after province, Provincial selects within their province, Regional hidden */}
            {isNationalSuperAdmin() && (
              <TextField
                select fullWidth margin="dense" required
                label="Region"
                value={schoolForm.regionalId || ''}
                onChange={(e) => {
                  const selected = schoolFormRegions.find(r => r.id === Number(e.target.value));
                  setSchoolForm({
                    ...schoolForm,
                    regionalId: Number(e.target.value),
                    region: selected ? selected.name : ''
                  });
                }}
                disabled={loadingSchoolFormRegions || !schoolForm.provinceId}
                helperText={!schoolForm.provinceId ? 'Select a province first' : ''}
              >
                <MenuItem value=""><em>Select Region</em></MenuItem>
                {safeFilter(schoolFormRegions, () => true).map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
            )}

            {isProvincialSuperAdmin() && (
              <TextField
                select fullWidth margin="dense" required
                label="Region"
                value={schoolForm.regionalId || ''}
                onChange={(e) => {
                  const selected = schoolFormRegions.find(r => r.id === Number(e.target.value));
                  setSchoolForm({
                    ...schoolForm,
                    regionalId: Number(e.target.value),
                    region: selected ? selected.name : ''
                  });
                }}
                disabled={loadingSchoolFormRegions}
                helperText={`Regions within ${currentUserProvinceName}`}
              >
                <MenuItem value=""><em>Select Region</em></MenuItem>
                {safeFilter(schoolFormRegions, () => true).map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchoolDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleSchoolSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : editingSchool ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog
        open={bulkUploadDialogOpen}
        onClose={() => !submitting && setBulkUploadDialogOpen(false)}
        maxWidth="md" fullWidth
      >
        <DialogTitle>Bulk Upload Schools</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload a CSV or Excel file with school data.
          </Typography>
          <Box
            sx={{
              border: `2px dashed ${isDragging ? 'primary.main' : 'grey.300'}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: isDragging ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('bulk-file-input').click()}
          >
            <input
              id="bulk-file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleBulkUploadFileChange}
            />
            <Typography variant="body1" gutterBottom>
              {isDragging ? 'Drop file here' : 'Drag and drop file here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports CSV, Excel (.xlsx, .xls) files
            </Typography>
          </Box>
          {bulkUploadFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="success.main">
                File selected: {bulkUploadFile.name}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Button size="small" variant="text" onClick={downloadBulkUploadTemplate}>
              Download template
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUploadDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleBulkUploadSubmit}
            variant="contained"
            disabled={submitting || !bulkUploadFile}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Uploading...' : 'Upload Schools'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={handleAdminDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
            <TextField
              label="First Name" fullWidth margin="dense" required
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            />
            <TextField
              label="Last Name" fullWidth margin="dense" required
              value={adminForm.lastName}
              onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
            />
          </Box>

          <TextField
            label="Email" type="email" fullWidth margin="dense" required
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
          />
          <TextField
            label="Phone Number" fullWidth margin="dense" required
            placeholder="e.g. 0123456789"
            value={adminForm.phoneNumber}
            onChange={(e) => setAdminForm({ ...adminForm, phoneNumber: e.target.value })}
          />

          <TextField
            select label="School" fullWidth margin="dense" required
            value={adminForm.schoolId}
            onChange={(e) => setAdminForm({ ...adminForm, schoolId: e.target.value })}
          >
            <MenuItem value=""><em>Select School</em></MenuItem>
            {safeFilter(schools, s => s && (!isProvincialSuperAdmin() || s.province === currentUserProvinceName))
              .map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}{!isProvincialSuperAdmin() ? ` (${s.province || 'No province'})` : ''}
                </MenuItem>
              ))}
          </TextField>

          {/* Auto-assigned province & region from selected school */}
          {adminForm.schoolId && (() => {
            const sel = schools.find(s => s.id === adminForm.schoolId);
            if (!sel) return null;
            return (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Province" fullWidth margin="dense"
                  value={sel.province || ''}
                  disabled
                  helperText="Auto-assigned from school"
                />
                <TextField
                  label="Region" fullWidth margin="dense"
                  value={sel.region || 'N/A'}
                  disabled
                  helperText="Auto-assigned from school"
                />
              </Box>
            );
          })()}

          <TextField
            label={editingAdmin ? 'Password (leave blank to keep current)' : 'Password'}
            type="password" fullWidth margin="dense"
            required={!editingAdmin}
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            helperText={editingAdmin ? 'Only enter a password to change it' : 'Minimum 6 characters'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAdminDialogClose} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleAdminSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : editingAdmin ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminDashboard;