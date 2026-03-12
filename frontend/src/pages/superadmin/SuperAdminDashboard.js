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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, School as SchoolIcon, AdminPanelSettings as AdminIcon, People as PeopleIcon, SupervisorAccount as MasterIcon
} from '@mui/icons-material';
import PageTitle from '../../components/common/PageTitle';
import SuperadminManagement from '../../components/superadmin/SuperadminManagement';
import { useAuth } from '../../context/AuthContext';
import { getAllSchools, getRegionalSchools, getAllRoleSpecificUsers, createSchool, updateSchool, deleteSchool, getAllAdmins, getRegionalAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../services/superAdminService';
import regionService from '../../services/regionService';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];

const SuperAdminDashboard = () => {
  const { isMaster, isNationalSuperAdmin, isRegionalSuperAdmin, isProvincialSuperAdmin, currentUser } = useAuth();
  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('schools');
  const [submitting, setSubmitting] = useState(false);

  // Regional filtering state
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // School status helper
  const getSchoolStatus = (school) => {
    // A school is "adopted" if it has an admin assigned
    const hasAdmin = admins.some(admin => admin.schoolId === school.id);
    return hasAdmin ? 'adopted' : 'pre-populated';
  };

  const getSchoolStatusColor = (status) => {
    switch (status) {
      case 'adopted': return 'success';
      case 'pre-populated': return 'default';
      default: return 'default';
    }
  };

  const getSchoolStatusText = (status) => {
    switch (status) {
      case 'adopted': return 'Adopted';
      case 'pre-populated': return 'Pre-populated';
      default: return 'Unknown';
    }
  };

  // Dialog states
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Form states
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    principalName: '',
    province: '',
    regionalId: null, 
    logo: ''
  });

  // School form regions state
  const [schoolFormRegions, setSchoolFormRegions] = useState([]);
  const [loadingSchoolFormRegions, setLoadingSchoolFormRegions] = useState(false);
  const [schoolFormProvinces, setSchoolFormProvinces] = useState([]);
  const [loadingSchoolFormProvinces, setLoadingSchoolFormProvinces] = useState(false);

  const [adminForm, setAdminForm] = useState({
    name: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    province:'',
    regionalId: '',
    schoolId: '',
    password: ''
  });

  // Bulk upload state
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadPreview, setBulkUploadPreview] = useState([]);
  const [bulkUploadErrors, setBulkUploadErrors] = useState([]);

  useEffect(() => {
    const initFilters = async () => {
      try {
        const provinces = await regionService.getAllProvinces();
        setProvinceOptions(Array.isArray(provinces) ? provinces : []);
      } catch (e) {
        setProvinceOptions(PROVINCES);
      }
    };

    initFilters();
    fetchData();
  }, [selectedRegion, selectedProvince]);

  useEffect(() => {
    const loadRegions = async () => {
      if (!selectedProvince) {
        setRegionOptions([]);
        return;
      }

      setLoadingRegions(true);
      try {
        const regions = await regionService.getRegionsByProvinceId(selectedProvince);
        setRegionOptions(Array.isArray(regions) ? regions : []);
      } catch (e) {
        setRegionOptions([]);
      } finally {
        setLoadingRegions(false);
      }
    };

    loadRegions();
  }, [selectedProvince]);

  // Load regions for school form when province changes
  useEffect(() => {
    const loadSchoolFormRegions = async () => {
      if (!schoolForm.province) {
        setSchoolFormRegions([]);
        return;
      }

      setLoadingSchoolFormRegions(true);
      try {
        const regions = await regionService.getRegionsByProvinceId(schoolForm.province);
        setSchoolFormRegions(Array.isArray(regions) ? regions : []);
      } catch (e) {
        setSchoolFormRegions([]);
      } finally {
        setLoadingSchoolFormRegions(false);
      }
    };

    loadSchoolFormRegions();
  }, [schoolForm.province]);

  // Load provinces for school form when dialog opens
  useEffect(() => {
    const loadSchoolFormProvinces = async () => {
      if (!schoolDialogOpen) return;
      
      setLoadingSchoolFormProvinces(true);
      try {
        const provinces = await regionService.getAllProvinces();
        setSchoolFormProvinces(Array.isArray(provinces) ? provinces : []);
      } catch (e) {
        setSchoolFormProvinces(PROVINCES);
      } finally {
        setLoadingSchoolFormProvinces(false);
      }
    };

    loadSchoolFormProvinces();
  }, [schoolDialogOpen]);

  const fetchData = async () => {

    try {

      setLoading(true);
      setError(null);



      const createdBy = currentUser?.email;
      if (!createdBy) {
      setError('Unable to identify user. Please log in again.');
      return;
       }

      

       // Build query parameters based on user role and selected filters
      const queryParams = new URLSearchParams();

      if (isNationalSuperAdmin()) {
        if (selectedRegion) queryParams.append('region', selectedRegion);
        if (selectedProvince) queryParams.append('province', selectedProvince);
      } else if (isRegionalSuperAdmin()) {
        if (currentUser?.region) queryParams.append('region', currentUser.region);
        if (selectedProvince) queryParams.append('province', selectedProvince);
      } else if (isProvincialSuperAdmin()) {
        if (currentUser?.province) queryParams.append('province', currentUser.province);
      }

      const queryString = queryParams.toString();

      const [schoolsData, adminsData] = await Promise.all([
        isRegionalSuperAdmin()
          ? getRegionalSchools(createdBy, currentUser?.region)
          : getAllSchools(createdBy, queryString),
        isRegionalSuperAdmin() ? getRegionalAdmins(createdBy, currentUser?.region) : getAllAdmins('admin', createdBy, queryString)
      ]);

      setSchools(schoolsData || []);
      setAdmins(adminsData || []);

    } catch (err) {

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load data';

      setError(message);

      console.error(err);

    } finally {

      setLoading(false);

    }

  };


  // School Handlers

  const checkDuplicateSchool = (schoolName, address) => {
    if (!schoolName || !schools.length) return [];
    
    const searchName = schoolName.toLowerCase().trim();
    const searchAddress = (address || '').toLowerCase().trim();
    
    const duplicates = schools.filter(school => {
      const existingName = (school.name || '').toLowerCase();
      const existingAddress = (school.address || '').toLowerCase();
      
      // Fuzzy matching for names (contains or very similar)
      const nameMatch = existingName.includes(searchName) || 
                       searchName.includes(existingName) ||
                       calculateSimilarity(searchName, existingName) > 0.8;
      
      // Address matching if provided
      const addressMatch = !searchAddress || 
                          existingAddress.includes(searchAddress) ||
                          searchAddress.includes(existingAddress);
      
      return nameMatch && addressMatch;
    });
    
    return duplicates;
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleSchoolSubmit = async () => {

    try {

      setSubmitting(true);

      setError(null);

  

      // Validate required fields
      const requiredFields = ['name', 'address', 'phoneNumber', 'email', 'principalName', 'province'];
      
      // Add region to required fields for National and Provincial SuperAdmins
      if (isNationalSuperAdmin() || isProvincialSuperAdmin()) {
        requiredFields.push('regionalId');
      }

      const missingFields = requiredFields.filter(field => {
      const value = schoolForm[field];
        if (value === null || value === undefined || value === '') return true;
        if (typeof value === 'object') return !value.name && !value.id;
        return !value?.toString().trim();
      });

      

      if (missingFields.length > 0) {

        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);

        return;

      }

      // Check for duplicate schools
      const duplicates = checkDuplicateSchool(schoolForm.name, schoolForm.address);
      if (duplicates.length > 0 && !editingSchool) {
        const duplicateNames = duplicates.map(d => d.name).join(', ');
        const confirmMessage = `Potential duplicate schools found: ${duplicateNames}\n\nDo you want to continue creating this school?`;
        
        if (!window.confirm(confirmMessage)) {
          return;
        }
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

      if (isRegionalSuperAdmin()) {

        formDataToSubmit.region = currentUser?.region;

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

      const updatedBy = currentUser?.email;

      await updateSchool(editingSchool.id, formDataToSubmit, updatedBy);

      alert('School updated successfully!');

    } else if (currentUser?.email) {
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
        regionalId: null,  
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

        alert('School deleted successfully!');

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
        phoneNumber: school.phoneNumber || '',
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
        province: isProvincialSuperAdmin() ? currentUser?.province : '',
        regionalId: isRegionalSuperAdmin() ? currentUser?.regionId : null, 
        logo: ''
      });

      // Reset school form regions when opening dialog
      setSchoolFormRegions([]);

    }

    setSchoolDialogOpen(true);

  };

  

  // Bulk Upload Handlers
  const handleBulkUploadFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBulkUploadFile(file);
      parseBulkUploadFile(file);
    }
  };

  const parseBulkUploadFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const rows = data.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        
        const schools = [];
        const errors = [];
        
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim());
          const school = {};
          
          headers.forEach((header, index) => {
            school[header] = values[index] || '';
          });
          
          // Validation
          const rowErrors = [];
          if (!school.name) rowErrors.push('Name is required');
          if (!school.address) rowErrors.push('Address is required');
          if (!school.phoneNumber) rowErrors.push('Phone number is required');
          if (!school.email) rowErrors.push('Email is required');
          if (!school.principalname) rowErrors.push('Principal name is required');
          if (!school.province) rowErrors.push('Province is required');
          
          // Check for duplicates in bulk upload
          const duplicates = checkDuplicateSchool(school.name, school.address);
          if (duplicates.length > 0) {
            rowErrors.push(`Potential duplicate: ${duplicates.map(d => d.name).join(', ')}`);
          }
          
          if (rowErrors.length > 0) {
            errors.push({ row: i + 1, errors: rowErrors, data: school });
          } else {
            schools.push({
              ...school,
              principalName: school.principalname, // Normalize field name
              region: school.region || ''
            });
          }
        }
        
        setBulkUploadPreview(schools);
        setBulkUploadErrors(errors);
      } catch (error) {
        setError('Failed to parse file. Please ensure it is a valid CSV file.');
        console.error('Parse error:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkUploadSubmit = async () => {
    if (!bulkUploadFile || bulkUploadPreview.length === 0) {
      setError('No valid schools to upload');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const createdBy = currentUser?.email;
      if (!createdBy) {
        setError('Unable to identify creator. Please log in again.');
        return;
      }

      // Upload schools one by one
      const results = [];
      for (const school of bulkUploadPreview) {
        try {
          await createSchool({ ...school, createdBy });
          results.push({ success: true, name: school.name });
        } catch (error) {
          results.push({ 
            success: false, 
            name: school.name, 
            error: error.response?.data?.message || error.message 
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);

      alert(`Bulk upload completed:\n✅ ${successful} schools created successfully\n❌ ${failed.length} schools failed`);
      
      if (failed.length > 0) {
        console.error('Failed uploads:', failed);
      }

      setBulkUploadDialogOpen(false);
      setBulkUploadFile(null);
      setBulkUploadPreview([]);
      setBulkUploadErrors([]);
      fetchData();
    } catch (error) {
      setError(error.message || 'Bulk upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadBulkUploadTemplate = () => {
    const template = [
      ['name', 'address', 'phoneNumber', 'email', 'principalName', 'province', 'region'],
      ['Example Primary School', '123 Main Street, Cape Town', '0211234567', 'info@example.edu.za', 'Mrs. Smith', 'Western Cape', 'Northern Region'],
      ['Sample High School', '456 Oak Avenue, Johannesburg', '0119876543', 'admin@sample.edu.za', 'Mr. Johnson', 'Gauteng', 'Central Region']
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'school_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Admin Handlers

  const handleAdminSubmit = async () => {

    try {

      setSubmitting(true);

      setError(null);



      const requiredFields = ['name', 'lastName', 'email', 'phoneNumber', 'schoolId'];

      if (!editingAdmin) requiredFields.push('password');

      const missingFields = requiredFields.filter(field => !String(adminForm[field] || '').trim());

      if (missingFields.length > 0) {

        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);

        return;

      }



      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(adminForm.email.trim())) {

        setError('Please enter a valid email address');

        return;

      }



      const phoneRegex = /^(\+27|0)[0-9]{9}$/;

      if (!phoneRegex.test(adminForm.phoneNumber.replace(/\s/g, ''))) {

        setError('Please enter a valid South African phone number (e.g., 0123456789 or +27123456789)');

        return;

      }



      if (!currentUser?.email) {

        setError('Unable to identify the current user. Please log in again.');

        return;

      }



      const selectedSchool = schools.find(s => s.id === adminForm.schoolId);

      if (isProvincialSuperAdmin() && selectedSchool?.province !== currentUser?.province) {

        setError(`You can only assign admins to schools in your province (${currentUser?.province})`);

        return;

      }



      const province =

        selectedSchool?.province ||

        (isProvincialSuperAdmin() ? currentUser?.province : null) ||

        editingAdmin?.province ||

        adminForm.province ||

        '';

      const region =

        selectedSchool?.region ||

        (isRegionalSuperAdmin() ? currentUser?.region : null) ||

        editingAdmin?.region ||

        adminForm.region ||

        '';



      const formDataToSubmit = {

        ...adminForm,

        name: adminForm.name.trim(),

        lastName: adminForm.lastName.trim(),

        email: adminForm.email.trim(),

        phoneNumber: adminForm.phoneNumber.trim(),

        province,

        region,

        createdBy: currentUser?.email,

        updatedBy: currentUser?.email 

      };



       // Only include password if it's a new admin or if it's being changed

      if (!editingAdmin || adminForm.password) {

        formDataToSubmit.password = adminForm.password;

      }



      const existingAdmin = admins.find(admin =>

        admin.email.toLowerCase() === formDataToSubmit.email.toLowerCase() &&

        admin.schoolId === formDataToSubmit.schoolId &&

        admin.id !== editingAdmin?.id

      );

      if (existingAdmin) {

        setError('An administrator with this email already exists for the selected school');

        return;

      }



      if (editingAdmin) {

        // For updates, we need to include the admin ID in the payload

        await updateAdmin(editingAdmin.id, {

          ...formDataToSubmit,

          id: editingAdmin.id // Make sure we include the ID in the payload

        });

        alert('Administrator updated successfully!');

      } else if (currentUser?.email) {
        await createAdmin(formDataToSubmit);

        alert(`Administrator created successfully by ${currentUser.email}!`);

      }

  



      setAdminDialogOpen(false);

      setEditingAdmin(null);

      setAdminForm({ name: '', lastName: '', email: '', phoneNumber: '', schoolId: '', password: '', province: isProvincialSuperAdmin() ? currentUser?.province : '', region: isRegionalSuperAdmin() ? currentUser?.region : '' });

      fetchData();

    } catch (err) {

      console.error('Admin submission error:', err);

      setError(err.message || `Failed to ${editingAdmin ? 'update' : 'create'} administrator.`);

    } finally {

      setSubmitting(false);

    }

  };



  



  const handleDeleteAdmin = async (adminId) => {

    if (window.confirm('Are you sure you want to delete this administrator?')) {

      try {

        await deleteAdmin(adminId);

        fetchData();

        alert('Administrator deleted successfully!');

      } catch (err) {

        console.error('Error deleting admin:', err);

        setError(err.response?.data?.message || 'Failed to delete administrator. Please try again.');

      }

    }

  };

  

  

  const openAdminDialog = (admin = null) => {

      setError(null);

      setSubmitting(false);

      

  

    if (admin) {

      const adminId = admin.id || admin.email; // Use email when ID is null

      setEditingAdmin({

        ...admin,

        id: adminId // Ensure ID is properly set

      });

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

        name: '',

        lastName: '',

        email: '',

        phoneNumber: '',

        schoolId: '',

        password: '',

        province: isProvincialSuperAdmin() ? currentUser?.province : '',

        region: isRegionalSuperAdmin() ? currentUser?.region : ''

      });

    }

  

    setAdminDialogOpen(true);

  };

  

  const handleAdminDialogClose = () => {

    setAdminDialogOpen(false);

    setEditingAdmin(null);

    setError(null);

    setAdminForm({

      name: '',

      lastName: '',

      email: '',

      phoneNumber: '',

      schoolId: '',

      password: '',

      province: isProvincialSuperAdmin() ? currentUser?.province : '',

      region: isRegionalSuperAdmin() ? currentUser?.region : ''

    });

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



      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 220 }} disabled={loading || isProvincialSuperAdmin() || isRegionalSuperAdmin()}>
          <InputLabel>Province</InputLabel>
          <Select
            value={selectedProvince}
            label="Province"
            onChange={(e) => {
              setSelectedProvince(e.target.value);
              setSelectedRegion('');
            }}
          >
            <MenuItem value="">All Provinces</MenuItem>
            {(provinceOptions.length ? provinceOptions : PROVINCES).map((province) => {
              const value = typeof province === 'object' ? (province.id ?? province.name) : province;
              const label = typeof province === 'object' ? (province.name ?? String(value)) : province;
              return (
                <MenuItem key={String(value)} value={value}>
                  {label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 260 }} disabled={loading || !selectedProvince || isRegionalSuperAdmin() || loadingRegions}>
          <InputLabel>Region</InputLabel>
          <Select
            value={selectedRegion}
            label="Region"
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <MenuItem value="">All Regions</MenuItem>
            {regionOptions.map((region) => {
              const value = typeof region === 'object' ? (region.id ?? region.name) : region;
              const label = typeof region === 'object' ? (region.name ?? String(value)) : region;
              return (
                <MenuItem key={String(value)} value={value}>
                  {label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          disabled={loading || (!selectedProvince && !selectedRegion)}
          onClick={() => {
            setSelectedProvince('');
            setSelectedRegion('');
          }}
        >
          Clear
        </Button>
      </Box>

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

                  <Typography color="text.secondary">Total Administrators</Typography>

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

              <Box sx={{ display: 'flex', gap: 1 }}>
                {isNationalSuperAdmin() && (
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setBulkUploadDialogOpen(true)}>
                    Bulk Upload Schools
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

                    <TableCell>Status</TableCell>

                    <TableCell align="right">Actions</TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {schools.map((school, index) => (

                    <TableRow key={school.id || `school-${index}`}>

                      <TableCell>{school.name}</TableCell>

                      <TableCell>{school.address}</TableCell>

                      <TableCell>

                        <Typography variant="body2">{school.email}</Typography>

                        <Typography variant="body2" color="text.secondary">{school.phoneNumber}</Typography>

                      </TableCell>

                      <TableCell>{school.principalName}</TableCell>

                      <TableCell>
                        <Chip 
                          label={getSchoolStatusText(getSchoolStatus(school))} 
                          color={getSchoolStatusColor(getSchoolStatus(school))} 
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>

              <Typography variant="h6">Administrator Management</Typography>

              <Button 

                variant="contained" 

                startIcon={<AddIcon />} 

                onClick={() => openAdminDialog(null)}

              >

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

                  {admins.map((admin, index) => {

                  const school =

                  schools.find(s => s.id === (admin.schoolId || admin.school?.id));



                  const schoolName =

                    school?.name ||

                    admin.school?.name ||

                    admin.schoolName ||

                    'Unknown School';

                    

                    return (

                    <TableRow key={admin.id || `admin-${index}`}>

                      <TableCell>{admin.name}</TableCell>

                      <TableCell>{admin.lastName || 'N/A'}</TableCell>

                      <TableCell>{admin.email}</TableCell>

                      <TableCell>{admin.phoneNumber}</TableCell>

                      <TableCell>

                        {schoolName}

                      </TableCell>

                      <TableCell>

                        <Chip label={admin.status || 'Active'} color={admin.status === 'Active' ? 'success' : 'default'} size="small" />

                      </TableCell>

                      <TableCell align="right">

                      <IconButton onClick={() => openAdminDialog(admin)}>

                        <EditIcon />

                      </IconButton>

                      <IconButton onClick={() => handleDeleteAdmin(admin.id || admin.email)} color="error">

                        <DeleteIcon />

                      </IconButton>

                      </TableCell>

                    </TableRow>

                  );

                  })}

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

          {/* Province field - only shown for National SuperAdmins */}
          {isNationalSuperAdmin() && (
            <TextField
              select
              fullWidth
              margin="dense"
              label="Province"
              name="province"
              value={schoolForm.province}
              onChange={(e) => {
                setSchoolForm({ ...schoolForm, province: e.target.value, region: '' });
              }}
              required
              disabled={loadingSchoolFormProvinces}
            >
              <MenuItem value="">
                <em>Select Province</em>
              </MenuItem>
              {(schoolFormProvinces.length ? schoolFormProvinces : PROVINCES).map((province) => {
                const value = typeof province === 'object' ? (province.id ?? province.name) : province;
                const label = typeof province === 'object' ? (province.name ?? String(value)) : province;
                return (
                  <MenuItem key={String(value)} value={value}>
                    {label}
                  </MenuItem>
                );
              })}
            </TextField>
          )}

          {/* Region field - shown for National and Provincial SuperAdmins */}
          {(isNationalSuperAdmin() || isProvincialSuperAdmin()) && (
            <TextField
              select
              label="Region"
              value={schoolForm.regionalId || ''}
              onChange={(e) => setSchoolForm({ ...schoolForm, regionalId: Number(e.target.value) })}
            >
              <MenuItem value="">
                <em>
                  {isNationalSuperAdmin() 
                    ? (!schoolForm.province ? 'Select Province First' : 'Select Region')
                    : 'Select Region'
                  }
                </em>
              </MenuItem>
              {schoolFormRegions.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Hidden field for Regional SuperAdmins - shows their assigned region */}
          {isRegionalSuperAdmin() && (
            <TextField
              fullWidth
              margin="dense"
              label="Region"
              value={currentUser?.region || ''}
              disabled
              helperText="Region is set based on your assigned region"
            />
          )}

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



      {/* Bulk Upload Dialog */}

      <Dialog open={bulkUploadDialogOpen} onClose={() => !submitting && setBulkUploadDialogOpen(false)} maxWidth="md" fullWidth>

        <DialogTitle>Bulk Upload Schools</DialogTitle>

        <DialogContent>

          {error && (

            <Alert severity="error" sx={{ mb: 2 }}>

              {error}

            </Alert>

          )}

          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload a CSV file with the following columns: name, address, phoneNumber, email, principalName, province, region (optional)
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" size="small" onClick={downloadBulkUploadTemplate}>
              Download Template
            </Button>
          </Box>

          <TextField

            type="file"

            accept=".csv"

            fullWidth

            margin="normal"

            onChange={handleBulkUploadFileChange}

            helperText="Select a CSV file containing school data"

          />

          {bulkUploadPreview.length > 0 && (

            <Box sx={{ mt: 2 }}>

              <Typography variant="h6" sx={{ mb: 1 }}>Preview ({bulkUploadPreview.length} schools)</Typography>

              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>

                <Table size="small">

                  <TableHead>

                    <TableRow>

                      <TableCell>Name</TableCell>

                      <TableCell>Address</TableCell>

                      <TableCell>Contact</TableCell>

                      <TableCell>Province</TableCell>

                      <TableCell>Region</TableCell>

                    </TableRow>

                  </TableHead>

                  <TableBody>

                    {bulkUploadPreview.slice(0, 10).map((school, index) => (

                      <TableRow key={index}>

                        <TableCell>{school.name}</TableCell>

                        <TableCell>{school.address}</TableCell>

                        <TableCell>{school.phoneNumber}</TableCell>

                        <TableCell>{school.province}</TableCell>

                        <TableCell>{school.region || '-'}</TableCell>

                      </TableRow>

                    ))}

                  </TableBody>

                </Table>

              </TableContainer>

              {bulkUploadPreview.length > 10 && (

                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>

                  ... and {bulkUploadPreview.length - 10} more schools

                </Typography>

              )}

            </Box>

          )}

          {bulkUploadErrors.length > 0 && (

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'error.main' }}>Validation Errors ({bulkUploadErrors.length})</Typography>
              {bulkUploadErrors.slice(0, 5).map((error, index) => (
                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                  Row {error.row}: {error.errors.join(', ')}
                </Alert>
              ))}

              {bulkUploadErrors.length > 5 && (

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>

                  ... and {bulkUploadErrors.length - 5} more errors

                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setBulkUploadDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUploadSubmit} 
            variant="contained" 
            disabled={submitting || bulkUploadPreview.length === 0}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Uploading...' : `Upload ${bulkUploadPreview.length} Schools`}
          </Button>
        </DialogActions>
      </Dialog>



      {/* Admin Dialog */}

      <Dialog open={adminDialogOpen} onClose={handleAdminDialogClose} maxWidth="sm" fullWidth>

        <DialogTitle>{editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}</DialogTitle>

        <DialogContent>

          {error && (

            <Alert severity="error" sx={{ mb: 2 }}>

              {error}

            </Alert>

          )}

          <TextField 

            label="First Name" 

            fullWidth 

            margin="dense" 

            value={adminForm.name} 

            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}

            required

          />

          <TextField 

            label="Last Name" 

            fullWidth 

            margin="dense" 

            value={adminForm.lastName} 

            onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}

            required

          />

          <TextField 

            label="Email" 

            type="email" 

            fullWidth 

            margin="dense" 

            value={adminForm.email} 

            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}

            required

          />

          <TextField 

            label="Phone Number" 

            fullWidth 

            margin="dense" 

            value={adminForm.phoneNumber} 

            onChange={(e) => setAdminForm({ ...adminForm, phoneNumber: e.target.value })}

            placeholder="e.g., 0123456789"

            required

          />

          <TextField 
            select 
            label="School" 
            fullWidth 
            margin="dense" 
            value={adminForm.schoolId} 
            onChange={(e) => setAdminForm({ ...adminForm, schoolId: e.target.value })}
            required
          >
            {schools
              .filter(school => 
                !isProvincialSuperAdmin() || school.province === currentUser?.province
              )
              .map((school) => (
                <MenuItem key={school.id} value={school.id}>
                  {school.name} {!isProvincialSuperAdmin() ? `(${school.province})` : ''}
                </MenuItem>
              ))}
          </TextField>

          {(isNationalSuperAdmin() || isRegionalSuperAdmin()) && (
            <TextField
              select
              fullWidth
              margin="normal"
              label="Region"
              name="region"
              value={adminForm.region}
              onChange={(e) => setAdminForm({ ...adminForm, region: e.target.value })}
              required={isNationalSuperAdmin()}
              disabled={isRegionalSuperAdmin()}
            >
              <MenuItem value="">
                <em>Select Region</em>
              </MenuItem>
              <MenuItem value="Northern Region">Northern Region</MenuItem>
              <MenuItem value="Eastern Region">Eastern Region</MenuItem>
              <MenuItem value="Central Region">Central Region</MenuItem>
              <MenuItem value="Western Region">Western Region</MenuItem>
            </TextField>
          )}

          <TextField 
            label={editingAdmin ? "Password (leave blank to keep current)" : "Password"} 
            type="password" 
            fullWidth 
            margin="dense" 
            value={adminForm.password} 
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            required={!editingAdmin}
            helperText={editingAdmin ? "Only enter a password if you want to change it" : "Minimum 6 characters"}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleAdminDialogClose} disabled={submitting}>
            Cancel
          </Button>

          <Button 
            onClick={handleAdminSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : (editingAdmin ? 'Update' : 'Create')}

          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

};



export default SuperAdminDashboard;

