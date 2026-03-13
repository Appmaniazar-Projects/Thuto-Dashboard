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
  FormControl,
  InputLabel,
  Select,
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
  getRegionalSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getAllAdmins,
  getRegionalAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../../services/superAdminService';
import regionService from '../../services/regionService';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

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

  // ── Resolved names for currentUser province/region
  // currentUser stores province: "9", region: "50" (IDs, not names)
  // These states hold the resolved human-readable names
  const [currentUserProvinceName, setCurrentUserProvinceName] = useState('');
  const [currentUserRegionName, setCurrentUserRegionName] = useState('');

  // ── Filter bar state ──────────────────────────────────────────
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // ── Dialog open/close ─────────────────────────────────────────
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // ── School form ───────────────────────────────────────────────
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    principalName: '',
    province: '',     // human-readable name sent to backend e.g. "Western Cape"
    provinceId: null, // numeric ID used only for loading regions dropdown
    regionalId: null, // numeric ID sent to backend
    region: '',       // human-readable name (display only)
    logo: ''
  });

  const [schoolFormRegions, setSchoolFormRegions] = useState([]);
  const [loadingSchoolFormRegions, setLoadingSchoolFormRegions] = useState(false);
  const [schoolFormProvinces, setSchoolFormProvinces] = useState([]);
  const [loadingSchoolFormProvinces, setLoadingSchoolFormProvinces] = useState(false);

  // ── Admin form ────────────────────────────────────────────────
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

  // ── Bulk upload state ─────────────────────────────────────────
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadPreview, setBulkUploadPreview] = useState([]);
  const [bulkUploadErrors, setBulkUploadErrors] = useState([]);

  // ─────────────────────────────────────────────────────────────
  // Resolve currentUser province/region IDs to human-readable names
  // currentUser.province = "9" (ID), currentUser.region = "50" (ID)
  // Runs once on mount and whenever currentUser changes
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const resolveUserLocation = async () => {
      if (!currentUser?.province) return;

      try {
        const provinces = await regionService.getAllProvinces();
        const matchedProvince = provinces.find(p =>
          String(typeof p === 'object' ? p.id : p) === String(currentUser.province)
        );
        const provinceName = typeof matchedProvince === 'object'
          ? matchedProvince.name
          : (matchedProvince || '');
        setCurrentUserProvinceName(provinceName);

        // Also resolve region name if currentUser has a region ID
        if (currentUser?.region) {
          const regions = await regionService.getRegionsByProvinceId(currentUser.province);
          const matchedRegion = regions.find(r =>
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

  // Helper: resolve province/region names on demand (used at submit time as fallback)
  const resolveLocationNames = async () => {
    try {
      let provinceName = currentUserProvinceName;
      let regionName = currentUserRegionName;

      if (!provinceName && currentUser?.province) {
        const provinces = await regionService.getAllProvinces();
        const match = provinces.find(p =>
          String(typeof p === 'object' ? p.id : p) === String(currentUser.province)
        );
        provinceName = typeof match === 'object' ? match.name : (match || '');
        setCurrentUserProvinceName(provinceName);
      }

      if (!regionName && currentUser?.region) {
        const regions = await regionService.getRegionsByProvinceId(currentUser.province);
        const match = regions.find(r => String(r.id) === String(currentUser.region));
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

  // Initial load + reload when filters change
  useEffect(() => {
    const initFilters = async () => {
      try {
        const provinces = await regionService.getAllProvinces();
        setProvinceOptions(Array.isArray(provinces) ? provinces : []);
      } catch {
        setProvinceOptions(PROVINCES);
      }
    };
    initFilters();
    fetchData();
  }, [selectedRegion, selectedProvince]);

  // Load filter-bar regions when a province is selected
  useEffect(() => {
    const load = async () => {
      if (!selectedProvince) { setRegionOptions([]); return; }
      setLoadingRegions(true);
      try {
        const regions = await regionService.getRegionsByProvinceId(selectedProvince);
        setRegionOptions(Array.isArray(regions) ? regions : []);
      } catch { setRegionOptions([]); }
      finally { setLoadingRegions(false); }
    };
    load();
  }, [selectedProvince]);

  // Load regions for the school form whenever provinceId changes
  // Also auto-triggers for Provincial SuperAdmin using their province ID from currentUser
  useEffect(() => {
    const load = async () => {
      const idToLoad =
        schoolForm.provinceId ||
        (isProvincialSuperAdmin() ? currentUser?.province : null);

      if (!idToLoad) { setSchoolFormRegions([]); return; }

      setLoadingSchoolFormRegions(true);
      try {
        const regions = await regionService.getRegionsByProvinceId(idToLoad);
        setSchoolFormRegions(Array.isArray(regions) ? regions : []);
      } catch { setSchoolFormRegions([]); }
      finally { setLoadingSchoolFormRegions(false); }
    };
    load();
  }, [schoolForm.provinceId, schoolDialogOpen]);

  // Load provinces list when school dialog opens (used by National SuperAdmin dropdown)
  useEffect(() => {
    if (!schoolDialogOpen) return;
    const load = async () => {
      setLoadingSchoolFormProvinces(true);
      try {
        const provinces = await regionService.getAllProvinces();
        setSchoolFormProvinces(Array.isArray(provinces) ? provinces : []);
      } catch { setSchoolFormProvinces(PROVINCES); }
      finally { setLoadingSchoolFormProvinces(false); }
    };
    load();
  }, [schoolDialogOpen]);

  // ─────────────────────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const createdBy = currentUser?.email;
      if (!createdBy) { setError('Unable to identify user. Please log in again.'); return; }

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
        isRegionalSuperAdmin()
          ? getRegionalAdmins(createdBy, currentUser?.region)
          : getAllAdmins('admin', createdBy, queryString)
      ]);

      setSchools(schoolsData || []);
      setAdmins(adminsData || []);
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
  // Duplicate detection helpers
  // ─────────────────────────────────────────────────────────────
  const levenshteinDistance = (s1, s2) => {
    const m = [];
    for (let i = 0; i <= s2.length; i++) m[i] = [i];
    for (let j = 0; j <= s1.length; j++) m[0][j] = j;
    for (let i = 1; i <= s2.length; i++)
      for (let j = 1; j <= s1.length; j++)
        m[i][j] = s2[i - 1] === s1[j - 1]
          ? m[i - 1][j - 1]
          : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    return m[s2.length][s1.length];
  };

  const calculateSimilarity = (a, b) => {
    const long = a.length > b.length ? a : b;
    const short = a.length > b.length ? b : a;
    if (!long.length) return 1;
    return (long.length - levenshteinDistance(long, short)) / long.length;
  };

  const checkDuplicateSchool = (name, address) => {
    if (!name || !schools.length) return [];
    const n = name.toLowerCase().trim();
    const a = (address || '').toLowerCase().trim();
    return schools.filter(s => {
      const nameMatch =
        s.name.toLowerCase().includes(n) ||
        n.includes(s.name.toLowerCase()) ||
        calculateSimilarity(n, s.name.toLowerCase()) > 0.8;
      const addrMatch =
        !a ||
        s.address?.toLowerCase().includes(a) ||
        a.includes(s.address?.toLowerCase());
      return nameMatch && addrMatch;
    });
  };

  // ─────────────────────────────────────────────────────────────
  // School handlers
  // ─────────────────────────────────────────────────────────────
  const openSchoolDialog = (school = null) => {
    setError(null);
    setSubmitting(false);

    if (school) {
      // Editing: find the provinceId so the region dropdown loads correctly
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
      // Creating new school — pre-fill based on role
      setEditingSchool(null);
      setSchoolForm({
        name: '',
        address: '',
        phoneNumber: '',
        email: '',
        principalName: '',
        // Provincial: use resolved province name; Regional: hidden so leave empty
        province: isProvincialSuperAdmin() ? currentUserProvinceName : '',
        // Provincial: province ID needed to load their region dropdown
        provinceId: isProvincialSuperAdmin() ? currentUser?.province || null : null,
        // Regional: region ID = currentUser.region (the field stores the ID)
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

      // Required field validation differs per role
      const requiredFields = ['name', 'address', 'phoneNumber', 'email', 'principalName'];
      if (isNationalSuperAdmin()) requiredFields.push('province');
      if (isNationalSuperAdmin() || isProvincialSuperAdmin()) requiredFields.push('regionalId');
      // Regional SuperAdmin: province + region are auto-assigned, no validation needed

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

      // Duplicate check on create only
      if (!editingSchool) {
        const dupes = checkDuplicateSchool(schoolForm.name, schoolForm.address);
        if (dupes.length > 0) {
          if (!window.confirm(
            `Potential duplicate schools found: ${dupes.map(d => d.name).join(', ')}\n\nContinue anyway?`
          )) return;
        }
      }

      // Format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolForm.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!/^(\+27|0)[0-9]{9}$/.test(schoolForm.phoneNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid South African phone number (e.g. 0123456789 or +27123456789)');
        return;
      }

      // Duplicate name check
      const existing = schools.find(s =>
        s.name.toLowerCase() === schoolForm.name.toLowerCase() && s.id !== editingSchool?.id
      );
      if (existing) { setError('A school with this name already exists'); return; }

      // Build payload — remove provinceId (internal only, never sent to backend)
      const payload = { ...schoolForm };
      delete payload.provinceId;

      // Auto-assign province/region for restricted roles
      // Re-resolve names at submit time so they're always available
      if (isProvincialSuperAdmin() || isRegionalSuperAdmin()) {
        const { provinceName, regionName } = await resolveLocationNames();

        if (isProvincialSuperAdmin()) {
          payload.province = provinceName || '';
          // regionalId already set by dropdown selection
        }

        if (isRegionalSuperAdmin()) {
          payload.province = provinceName || '';              // "Western Cape"
          payload.region = regionName || '';                  // "Northern Region"
          payload.regionalId = Number(currentUser?.region) || null; // 50
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

      // Province and region are auto-assigned from the selected school
      const province =
        selectedSchool?.province ||
        currentUserProvinceName ||
        adminForm.province || '';
      const region =
        selectedSchool?.region ||
        currentUserRegionName ||
        adminForm.region || '';

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

      const duplicate = admins.find(a =>
        a.email.toLowerCase() === payload.email.toLowerCase() &&
        a.schoolId === payload.schoolId &&
        a.id !== editingAdmin?.id
      );
      if (duplicate) { setError('An admin with this email already exists for this school'); return; }

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
  // Bulk upload helpers
  // ─────────────────────────────────────────────────────────────
  const handleBulkUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setBulkUploadFile(file); parseBulkUploadFile(file); }
  };

  const parseBulkUploadFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = e.target.result.split('\n').filter(r => r.trim());
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const schoolsList = [], errors = [];
        for (let i = 1; i < rows.length; i++) {
          const vals = rows[i].split(',').map(v => v.trim());
          const school = {};
          headers.forEach((h, idx) => { school[h] = vals[idx] || ''; });
          const rowErrors = [];
          if (!school.name) rowErrors.push('Name required');
          if (!school.address) rowErrors.push('Address required');
          if (!school.phonenumber) rowErrors.push('Phone required');
          if (!school.email) rowErrors.push('Email required');
          if (!school.principalname) rowErrors.push('Principal name required');
          if (!school.province) rowErrors.push('Province required');
          const dupes = checkDuplicateSchool(school.name, school.address);
          if (dupes.length) rowErrors.push(`Duplicate: ${dupes.map(d => d.name).join(', ')}`);
          if (rowErrors.length) {
            errors.push({ row: i + 1, errors: rowErrors, data: school });
          } else {
            schoolsList.push({
              ...school,
              principalName: school.principalname,
              region: school.region || ''
            });
          }
        }
        setBulkUploadPreview(schoolsList);
        setBulkUploadErrors(errors);
      } catch { setError('Failed to parse CSV file.'); }
    };
    reader.readAsText(file);
  };

  const handleBulkUploadSubmit = async () => {
    if (!bulkUploadFile || !bulkUploadPreview.length) { setError('No valid schools to upload'); return; }
    try {
      setSubmitting(true);
      setError(null);
      const createdBy = currentUser?.email;
      if (!createdBy) { setError('Unable to identify creator.'); return; }
      const results = [];
      for (const school of bulkUploadPreview) {
        try {
          await createSchool({ ...school, createdBy });
          results.push({ success: true, name: school.name });
        } catch (err) {
          results.push({
            success: false,
            name: school.name,
            error: err.response?.data?.message || err.message
          });
        }
      }
      const ok = results.filter(r => r.success).length;
      const fail = results.filter(r => !r.success);
      alert(`Bulk upload done:\n✅ ${ok} created\n❌ ${fail.length} failed`);
      setBulkUploadDialogOpen(false);
      setBulkUploadFile(null);
      setBulkUploadPreview([]);
      setBulkUploadErrors([]);
      fetchData();
    } catch (err) {
      setError(err.message || 'Bulk upload failed');
    } finally { setSubmitting(false); }
  };

  const downloadBulkUploadTemplate = () => {
    const csv = [
      ['name', 'address', 'phoneNumber', 'email', 'principalName', 'province', 'region'],
      ['Example Primary School', '123 Main St, Cape Town', '0211234567', 'info@example.edu.za', 'Mrs Smith', 'Western Cape', 'Northern Region'],
      ['Sample High School', '456 Oak Ave, Johannesburg', '0119876543', 'admin@sample.edu.za', 'Mr Johnson', 'Gauteng', 'Central Region']
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

      {/* ── Filter bar ── */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl
          size="small"
          sx={{ minWidth: 220 }}
          disabled={loading || isProvincialSuperAdmin() || isRegionalSuperAdmin()}
        >
          <InputLabel>Province</InputLabel>
          <Select
            value={selectedProvince}
            label="Province"
            onChange={(e) => { setSelectedProvince(e.target.value); setSelectedRegion(''); }}
          >
            <MenuItem value="">All Provinces</MenuItem>
            {(provinceOptions.length ? provinceOptions : PROVINCES).map((p) => {
              const v = typeof p === 'object' ? (p.id ?? p.name) : p;
              const l = typeof p === 'object' ? (p.name ?? String(v)) : p;
              return <MenuItem key={String(v)} value={v}>{l}</MenuItem>;
            })}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{ minWidth: 260 }}
          disabled={loading || !selectedProvince || isRegionalSuperAdmin() || loadingRegions}
        >
          <InputLabel>Region</InputLabel>
          <Select
            value={selectedRegion}
            label="Region"
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <MenuItem value="">All Regions</MenuItem>
            {regionOptions.map((r) => {
              const v = typeof r === 'object' ? (r.id ?? r.name) : r;
              const l = typeof r === 'object' ? (r.name ?? String(v)) : r;
              return <MenuItem key={String(v)} value={v}>{l}</MenuItem>;
            })}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          size="small"
          disabled={!selectedProvince && !selectedRegion}
          onClick={() => { setSelectedProvince(''); setSelectedRegion(''); }}
        >
          Clear
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Tab navigation ── */}
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

      {/* ── Stats cards ── */}
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

      {/* ══════════════════════════════════════════════════════════
          Schools tab
      ══════════════════════════════════════════════════════════ */}
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
                  {schools.map((school, i) => (
                    <TableRow key={school.id || `school-${i}`}>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.address}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{school.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{school.phoneNumber}</Typography>
                      </TableCell>
                      <TableCell>{school.principalName}</TableCell>
                      <TableCell>{school.province || 'N/A'}</TableCell>
                      <TableCell>{school.region || school.regionalId || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={admins.some(a => a.schoolId === school.id) ? 'Active' : 'Pre-populated'}
                          color={admins.some(a => a.schoolId === school.id) ? 'success' : 'default'}
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

      {/* ══════════════════════════════════════════════════════════
          Admins tab
      ══════════════════════════════════════════════════════════ */}
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
                  {admins.map((admin, i) => {
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

      {/* ══════════════════════════════════════════════════════════
          Superadmin management tab (Master only)
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'superadmins' && isMaster() && (
        <SuperadminManagement />
      )}

      {/* ══════════════════════════════════════════════════════════
          School Dialog
      ══════════════════════════════════════════════════════════ */}
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

            {/* ── Province ─────────────────────────────────────── */}

            {/* National SuperAdmin: selects province from dropdown */}
            {isNationalSuperAdmin() && (
              <TextField
                select fullWidth margin="dense" required
                label="Province"
                value={schoolForm.provinceId || ''}
                onChange={(e) => {
                  const selectedProv = schoolFormProvinces.find(p =>
                    (typeof p === 'object' ? p.id : p) === e.target.value
                  );
                  setSchoolForm({
                    ...schoolForm,
                    province: typeof selectedProv === 'object'
                      ? selectedProv.name
                      : String(selectedProv || ''),
                    provinceId: e.target.value,
                    regionalId: null,
                    region: ''
                  });
                }}
                disabled={loadingSchoolFormProvinces}
              >
                <MenuItem value=""><em>Select Province</em></MenuItem>
                {(schoolFormProvinces.length ? schoolFormProvinces : PROVINCES).map((p) => {
                  const v = typeof p === 'object' ? p.id : p;
                  const l = typeof p === 'object' ? p.name : p;
                  return <MenuItem key={String(v)} value={v}>{l}</MenuItem>;
                })}
              </TextField>
            )}

            {/* Provincial SuperAdmin: province shown read-only using resolved name */}
            {isProvincialSuperAdmin() && (
              <TextField
                fullWidth margin="dense" label="Province"
                value={currentUserProvinceName || ''}
                disabled
                helperText="Your assigned province"
              />
            )}

            {/* Regional SuperAdmin: province completely hidden, auto-assigned in payload */}

            {/* ── Region ──────────────────────────────────────── */}

            {/* National SuperAdmin: selects region after choosing province */}
            {isNationalSuperAdmin() && (
              <TextField
                select fullWidth margin="dense" required
                label="Region"
                value={schoolForm.regionalId || ''}
                onChange={(e) => {
                  const selectedReg = schoolFormRegions.find(r => r.id === Number(e.target.value));
                  setSchoolForm({
                    ...schoolForm,
                    regionalId: Number(e.target.value),
                    region: selectedReg ? selectedReg.name : ''
                  });
                }}
                disabled={loadingSchoolFormRegions || !schoolForm.provinceId}
                helperText={!schoolForm.provinceId ? 'Select a province first' : ''}
              >
                <MenuItem value=""><em>Select Region</em></MenuItem>
                {schoolFormRegions.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
            )}

            {/* Provincial SuperAdmin: selects region within their assigned province */}
            {isProvincialSuperAdmin() && (
              <TextField
                select fullWidth margin="dense" required
                label="Region"
                value={schoolForm.regionalId || ''}
                onChange={(e) => {
                  const selectedReg = schoolFormRegions.find(r => r.id === Number(e.target.value));
                  setSchoolForm({
                    ...schoolForm,
                    regionalId: Number(e.target.value),
                    region: selectedReg ? selectedReg.name : ''
                  });
                }}
                disabled={loadingSchoolFormRegions}
                helperText={`Regions within ${currentUserProvinceName}`}
              >
                <MenuItem value=""><em>Select Region</em></MenuItem>
                {schoolFormRegions.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
            )}

            {/* Regional SuperAdmin: region completely hidden, auto-assigned in payload */}
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

      {/* ══════════════════════════════════════════════════════════
          Bulk Upload Dialog
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={bulkUploadDialogOpen}
        onClose={() => !submitting && setBulkUploadDialogOpen(false)}
        maxWidth="md" fullWidth
      >
        <DialogTitle>Bulk Upload Schools</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload a CSV with columns: name, address, phoneNumber, email, principalName, province, region (optional)
          </Typography>
          <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={downloadBulkUploadTemplate}>
            Download Template
          </Button>
          <TextField
            type="file" fullWidth margin="normal"
            onChange={handleBulkUploadFileChange}
            helperText="Select a CSV file"
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
                      <TableCell>Phone</TableCell>
                      <TableCell>Province</TableCell>
                      <TableCell>Region</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkUploadPreview.slice(0, 10).map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.address}</TableCell>
                        <TableCell>{s.phoneNumber}</TableCell>
                        <TableCell>{s.province}</TableCell>
                        <TableCell>{s.region || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {bulkUploadPreview.length > 10 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ... and {bulkUploadPreview.length - 10} more
                </Typography>
              )}
            </Box>
          )}
          {bulkUploadErrors.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                Validation Errors ({bulkUploadErrors.length})
              </Typography>
              {bulkUploadErrors.slice(0, 5).map((e, i) => (
                <Alert key={i} severity="error" sx={{ mb: 1 }}>Row {e.row}: {e.errors.join(', ')}</Alert>
              ))}
              {bulkUploadErrors.length > 5 && (
                <Typography variant="body2" color="text.secondary">
                  ... and {bulkUploadErrors.length - 5} more errors
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUploadDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleBulkUploadSubmit}
            variant="contained"
            disabled={submitting || !bulkUploadPreview.length}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Uploading...' : `Upload ${bulkUploadPreview.length} Schools`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════
          Admin Dialog
      ══════════════════════════════════════════════════════════ */}
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

          {/* School selector */}
          <TextField
            select label="School" fullWidth margin="dense" required
            value={adminForm.schoolId}
            onChange={(e) => setAdminForm({ ...adminForm, schoolId: e.target.value })}
          >
            <MenuItem value=""><em>Select School</em></MenuItem>
            {schools
              .filter(s => !isProvincialSuperAdmin() || s.province === currentUserProvinceName)
              .map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}{!isProvincialSuperAdmin() ? ` (${s.province || 'No province'})` : ''}
                </MenuItem>
              ))}
          </TextField>

          {/* Auto-assigned province & region from selected school — read-only display */}
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
                  value={sel.region || sel.regionalId || ''}
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