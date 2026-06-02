import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

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
  Autocomplete,

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

  Grid,

  FormControl,

  InputLabel,

  Select,

  InputAdornment,

  Stack

} from '@mui/material';

import {

  Add as AddIcon,

  Edit as EditIcon,

  Delete as DeleteIcon,

  School as SchoolIcon,

  AdminPanelSettings as AdminIcon,

  SupervisorAccount as MasterIcon,

  Search as SearchIcon,

  FilterList as FilterListIcon,

  Clear as ClearIcon,

  UploadFile as UploadFileIcon,

  EmojiEvents as SportsIcon

} from '@mui/icons-material';

import PageTitle from '../../components/common/PageTitle';

import SuperadminManagement from '../../components/superadmin/SuperadminManagement';

import { useAuth } from '../../context/AuthContext';

import { useNavigate } from 'react-router-dom';

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

} from '../../services/superadminService';
import { getRoleDisplayName } from '../../constants/roleLabels';
import regionService from '../../services/regionService';
import analyticsService from '../../services/analyticsService';



// ScrollableTable: wraps a table with a top scrollbar that mirrors the bottom one

const ScrollableTable = ({ children }) => {

  const topRef = useRef(null);

  const bottomRef = useRef(null);

  const syncingRef = useRef(false);



  const syncTop = useCallback(() => {

    if (syncingRef.current) return;
    syncingRef.current = true;

    if (topRef.current && bottomRef.current) {
      topRef.current.scrollLeft = bottomRef.current.scrollLeft;
    }

    syncingRef.current = false;

  }, []);



  const syncBottom = useCallback(() => {

    if (syncingRef.current) return;

    syncingRef.current = true;

    if (topRef.current && bottomRef.current) {

      bottomRef.current.scrollLeft = topRef.current.scrollLeft;

    }

    syncingRef.current = false;

  }, []);



  return (

    <Box>

      {/* Top scrollbar */}

      <Box

        ref={topRef}

        onScroll={syncBottom}

        sx={{ overflowX: 'auto', overflowY: 'hidden', height: 12, mb: 0.5 }}

      >

        {/* Phantom div — same width as the table — so the scrollbar appears */}

        <Box sx={{ height: 1, minWidth: '100%', width: 'max-content' }}>

          {React.cloneElement(children, { style: { visibility: 'hidden', height: 0, overflow: 'hidden' } })}

        </Box>

      </Box>

      {/* Actual table */}

      <TableContainer

        component={Paper}

        ref={bottomRef}

        onScroll={syncTop}

        sx={{ overflowX: 'auto' }}

      >

        {children}

      </TableContainer>

    </Box>

  );

};

const SuperAdminDashboard = () => {
  const {
    isMaster,
    isNationalSuperAdmin,
    isRegionalSuperAdmin,
    isProvincialSuperAdmin,
    currentUser
  } = useAuth();

  const navigate = useNavigate();

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

    schoolIds: [],

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

  // Client-side filter state (National/Master only)

  // Derives filtered lists from already-loaded data — no extra API calls

  // ─────────────────────────────────────────────────────────────

  const [filterProvince, setFilterProvince] = useState('');

  const [filterRegion, setFilterRegion] = useState('');

  const [filterRegionOptions, setFilterRegionOptions] = useState([]);

  const [loadingFilterRegions, setLoadingFilterRegions] = useState(false);

  const [searchSchoolName, setSearchSchoolName] = useState('');

  // Admin filters
  const [adminFilterProvince, setAdminFilterProvince] = useState('');
  const [adminFilterRegion, setAdminFilterRegion] = useState('');
  const [adminSearchSchoolName, setAdminSearchSchoolName] = useState('');
  const [adminLoadingFilterRegions, setAdminLoadingFilterRegions] = useState(false);



  // Only National SuperAdmin and Master see multiple provinces — show filter for them

  const showFilter = isNationalSuperAdmin() || isMaster() || isProvincialSuperAdmin();
  const showSchoolFilter = showFilter;
  const showAdminFilter = showFilter;



  // Derived unique province list from loaded schools (no extra API call)

  const filterProvinceOptions = Array.from(

    new Set(safeFilter(schools, s => s?.province).map(s => s.province))

  ).sort();



  // Load regions for the filter bar when a province is selected

  useEffect(() => {

    if (!filterProvince) { setFilterRegionOptions([]); setFilterRegion(''); return; }

    setLoadingFilterRegions(true);

    regionService.getRegionsByProvinceId(

      // Find province ID from name — use schoolFormProvinces if loaded, otherwise search by name

      schoolFormProvinces.find(p => (typeof p === 'object' ? p.name : p) === filterProvince)?.id || filterProvince

    )

      .then(data => setFilterRegionOptions(normalizeArray(data)))

      .catch(() => {

        // Fallback: derive unique regions from already-loaded schools for selected province

        const regions = Array.from(

          new Set(

            safeFilter(schools, s => s?.province === filterProvince && s?.region)

              .map(s => s.region)

          )

        ).sort().map(name => ({ id: name, name }));

        setFilterRegionOptions(regions);

      })

      .finally(() => setLoadingFilterRegions(false));

}, [filterProvince]);



// Apply client-side filters to already-loaded data - optimized with useMemo
const filteredSchools = useMemo(() => {
  return safeFilter(schools, s => {
    if (filterProvince && s.province !== filterProvince) return false;
    if (filterRegion && s.region !== filterRegion) return false;
    if (searchSchoolName && !s.name?.toLowerCase().includes(searchSchoolName.toLowerCase())) return false;
    return true;
  });
}, [schools, filterProvince, filterRegion, searchSchoolName]);

  const filteredAdmins = useMemo(() => {
    return safeFilter(admins, a => {
      if (filterProvince && a.province !== filterProvince) return false;
    const adminSchoolIds = Array.isArray(a.schoolIds) ? a.schoolIds
    : a.schoolId ? [a.schoolId]
    : a.school?.id ? [a.school.id]
    : [];

      if (filterRegion) {
        const hasMatch = adminSchoolIds.some(id => {
          const s = schools.find(sc => sc.id === id);
          return s?.region === filterRegion;
        });
        if (!hasMatch) return false;
      }
      if (searchSchoolName) {
        const hasMatch = adminSchoolIds.some(id => {
          const s = schools.find(sc => sc.id === id);
          return s?.name?.toLowerCase().includes(searchSchoolName.toLowerCase());
        });
        if (!hasMatch) return false;
      }
    return true;
  });
}, [admins, filterProvince, filterRegion, searchSchoolName, schools]);



// ─────────────────────────────────────────────────────────────
    // Only resolve location if we have user data, but don't block initial load

    useEffect(() => {
      const resolveUserLocation = async () => {
        if (currentUser?.province) {
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
        }
      };

      // Run in background without blocking
      resolveUserLocation();
    }, [currentUser?.province, setCurrentUserProvinceName, setCurrentUserRegionName]);



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



  // Initial data load - optimized for performance
  useEffect(() => {
    if (currentUser?.email) {
      // Start data loading immediately but don't block UI
      const loadData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const createdBy = currentUser.email;
          
          // Load schools and admins in parallel
          const [schoolsData, adminsData] = await Promise.all([
            getAllSchools(createdBy),
            getAllAdmins('admin', createdBy)
          ]);

          setSchools(normalizeArray(schoolsData));
          setAdmins(normalizeArray(adminsData));
          analyticsService.trackPageView('superadmin_dashboard', { role: currentUser.role });
          
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

      // Use setTimeout to prevent blocking the UI thread
      const timer = setTimeout(loadData, 10);
      return () => clearTimeout(timer);
    }
  }, [currentUser?.email]); // Depend on user being available



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

  // Data fetching without pagination

  const fetchData = async () => {

    try {

      setLoading(true);

      setError(null);

      

      const createdBy = currentUser?.email;

      if (!createdBy) { 

        setError('Unable to identify user. Please log in again.'); 

        return; 

      }

      // Load all data at once

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

        schoolIds: (() => {
          if (Array.isArray(admin.schoolIds)) return admin.schoolIds;
          if (admin.schoolId) return [admin.schoolId];
          if (admin.school?.id) return [admin.school.id];
          return [];
        })(),

        password: '',

        province: admin.province || '',

        region: admin.region || ''

      });

    } else {

      setEditingAdmin(null);

      setAdminForm({

        name: '', lastName: '', email: '', phoneNumber: '',

        schoolIds: [], password: '', province: '', region: ''

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

      schoolIds: [], password: '', province: '', region: ''

    });

  };



  const handleAdminSubmit = async () => {

    try {

      setSubmitting(true);

      setError(null);



      const required = ['name', 'lastName', 'email', 'phoneNumber'];

      if (!editingAdmin) required.push('password');

      const missing = required.filter(f => !String(adminForm[f] || '').trim());
      if (!Array.isArray(adminForm.schoolIds) || adminForm.schoolIds.length === 0) {
        missing.push('schoolIds');
      }

      if (missing.length) { setError(`Please fill in: ${missing.join(', ')}`); return; }



      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email.trim())) {

        setError('Please enter a valid email address'); return;

      }

      if (!/^(\+27|0)[0-9]{9}$/.test(adminForm.phoneNumber.replace(/\s/g, ''))) {

        setError('Please enter a valid South African phone number'); return;

      }



      const selectedSchools = schools.filter(s => adminForm.schoolIds.includes(s.id));

      if (isProvincialSuperAdmin() && selectedSchools.some(s => s.province !== currentUserProvinceName)) {
        setError(`You can only assign admins to schools in ${currentUserProvinceName}`); return;
      }

      // Use the first school's province/region (or the user's own if none selected)
      const province = selectedSchools[0]?.province || currentUserProvinceName || adminForm.province || '';
      const region = selectedSchools[0]?.region || currentUserRegionName || adminForm.region || '';


      const payload = {

        ...adminForm,
        name: adminForm.name.trim(),
        lastName: adminForm.lastName.trim(),
        email: adminForm.email.trim(),
        phoneNumber: adminForm.phoneNumber.trim(),
        province,
        region,
        schoolIds: adminForm.schoolIds,   // array of IDs
        schoolId: adminForm.schoolIds[0] ?? null,
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

        schoolIds: [], password: '', province: '', region: ''

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

      console.log('Bulk upload raw response:', JSON.stringify(results));



      const resultArray = normalizeArray(results);

      if (resultArray.length > 0) {

        const ok = resultArray.filter(r => r.success).length;

        const fail = resultArray.filter(r => !r.success).length;

        alert(`Bulk upload complete!\n✅ ${ok} schools created\n❌ ${fail} failed`);

      } else if (results?.message) {

        alert(`Bulk upload: ${results.message}`);

      } else if (results?.success === true) {

        alert('Bulk upload successful!');

      } else {

        alert('Bulk upload submitted. Refresh to see results.');

      }



      setBulkUploadDialogOpen(false);

      setBulkUploadFile(null);

      fetchData();

    } catch (err) {

      alert(`Bulk upload failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);

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

        title={`${getRoleDisplayName(currentUser?.role)} Dashboard`}

        subtitle="Manage schools and administrators across the platform"

      />



      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}



      {/* Tab navigation */}

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>

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

        {!isNationalSuperAdmin() && !isProvincialSuperAdmin() && (
          <Button
            variant={activeTab === 'sports' ? 'contained' : 'outlined'}
            onClick={() => navigate('/sports')}
            startIcon={<SportsIcon />}
          >Sports Center</Button>
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
      

      {activeTab === 'schools' && (

        <Card>

          <CardContent>

            <Box sx={{ mb: 3 }}>

              {/* ── Row 1: Title + action buttons ── */}

              <Stack

                direction={{ xs: 'column', sm: 'row' }}

                justifyContent="space-between"

                alignItems={{ xs: 'flex-start', sm: 'center' }}

                spacing={1.5}

                sx={{ mb: showFilter ? 2 : 0 }}

              >

                <Stack direction="row" spacing={1.5} alignItems="center">

                  <Typography variant="h6" fontWeight={600}>

                    School Management

                  </Typography>

                  {(filterProvince || filterRegion || searchSchoolName) && (

                    <Chip

                      label={`${[filterProvince, filterRegion, searchSchoolName].filter(Boolean).length} filter${[filterProvince, filterRegion, searchSchoolName].filter(Boolean).length > 1 ? 's' : ''} active`}

                      size="small"

                      color="primary"

                      variant="outlined"

                      sx={{ height: 22, fontSize: 11 }}

                    />

                  )}

                </Stack>



                <Stack direction="row" spacing={1}>

                  {isNationalSuperAdmin() && (

                    <Button

                      variant="outlined"

                      startIcon={<UploadFileIcon fontSize="small" />}

                      onClick={() => setBulkUploadDialogOpen(true)}

                      sx={{ minHeight: 40, borderRadius: 2, fontWeight: 600 }}

                    >

                      Bulk Upload

                    </Button>

                  )}

                  <Button

                    variant="contained"

                    startIcon={<AddIcon fontSize="small" />}

                    onClick={() => openSchoolDialog()}

                    sx={{ minHeight: 40, borderRadius: 2, fontWeight: 600 }}

                  >

                    Add School

                  </Button>

                </Stack>

              </Stack>



              {/* ── Row 2: Filters (National / Master only) ── */}

              {showFilter && (

                <Box

                  sx={{

                    p: 2,

                    borderRadius: 2,

                    bgcolor: 'grey.50',

                    border: '1px solid',

                    borderColor: 'grey.200',

                  }}

                >

                  <Stack

                    direction="row"

                    spacing={0.75}

                    alignItems="center"

                    sx={{ mb: 1.5 }}

                  >

                    <FilterListIcon sx={{ fontSize: 16, color: 'text.secondary' }} />

                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5} textTransform="uppercase">

                      Filters

                    </Typography>

                  </Stack>



                  <Stack

                    direction={{ xs: 'column', sm: 'row' }}

                    spacing={1.5}

                    alignItems={{ xs: 'stretch', sm: 'center' }}

                    flexWrap="wrap"

                    useFlexGap

                  >

                    {/* Province */}

                    <FormControl size="small" sx={{ minWidth: 180, flex: '0 0 auto' }}>

                      <InputLabel>Province</InputLabel>

                      <Select

                        value={filterProvince}

                        label="Province"

                        onChange={(e) => { setFilterProvince(e.target.value); setFilterRegion(''); }}

                        sx={{ borderRadius: 2, bgcolor: 'background.paper' }}

                      >

                        <MenuItem value="">All Provinces</MenuItem>

                        {filterProvinceOptions.map((p) => (

                          <MenuItem key={p} value={p}>{p}</MenuItem>

                        ))}

                      </Select>

                    </FormControl>



                    {/* Region */}

                    <FormControl

                      size="small"

                      sx={{ minWidth: 220, flex: '0 0 auto' }}

                      disabled={!filterProvince || loadingFilterRegions}

                    >

                      <InputLabel>

                        {loadingFilterRegions ? 'Loading regions…' : 'Region'}

                      </InputLabel>

                      <Select

                        value={filterRegion}

                        label={loadingFilterRegions ? 'Loading regions…' : 'Region'}

                        onChange={(e) => setFilterRegion(e.target.value)}

                        sx={{ borderRadius: 2, bgcolor: 'background.paper' }}

                      >

                        <MenuItem value="">All Regions</MenuItem>

                        {filterRegionOptions.map((r) => {

                          const val = typeof r === 'object' ? r.name : r;

                          const key = typeof r === 'object' ? r.id : r;

                          return <MenuItem key={key} value={val}>{val}</MenuItem>;

                        })}

                      </Select>

                    </FormControl>



                    {/* School name search */}

                    <TextField

                      size="small"

                      placeholder="Search by school name…"

                      value={searchSchoolName}

                      onChange={(e) => setSearchSchoolName(e.target.value)}

                      sx={{

                        flex: '1 1 220px',

                        minWidth: 200,

                        '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' },

                      }}

                      InputProps={{

                        startAdornment: (

                          <InputAdornment position="start">

                            <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />

                          </InputAdornment>

                        ),

                        endAdornment: searchSchoolName ? (

                          <InputAdornment position="end">

                            <IconButton

                              size="small"

                              onClick={() => setSearchSchoolName('')}

                              edge="end"

                              aria-label="Clear search"

                            >

                              <ClearIcon sx={{ fontSize: 16 }} />

                            </IconButton>

                          </InputAdornment>

                        ) : null,

                      }}

                    />



                    {/* Clear all */}

                    {(filterProvince || filterRegion || searchSchoolName) && (

                      <Button

                        size="small"

                        variant="text"

                        color="inherit"

                        onClick={() => { setFilterProvince(''); setFilterRegion(''); setSearchSchoolName(''); }}

                        startIcon={<ClearIcon fontSize="small" />}

                        sx={{

                          color: 'text.secondary',

                          fontWeight: 600,

                          fontSize: 13,

                          px: 1.5,

                          borderRadius: 2,

                          whiteSpace: 'nowrap',

                          flex: '0 0 auto',

                          '&:hover': { bgcolor: 'error.50', color: 'error.main' },

                        }}

                      >

                        Clear all

                      </Button>

                    )}

                  </Stack>



                  {/* Active filter chips */}

                  {(filterProvince || filterRegion || searchSchoolName) && (

                    <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>

                      {filterProvince && (

                        <Chip

                          label={`Province: ${filterProvince}`}

                          size="small"

                          onDelete={() => setFilterProvince('')}

                          sx={{ height: 24, fontSize: 12 }}

                        />

                      )}

                      {filterRegion && (

                        <Chip

                          label={`Region: ${filterRegion}`}

                          size="small"

                          onDelete={() => setFilterRegion('')}

                          sx={{ height: 24, fontSize: 12 }}

                        />

                      )}

                      {searchSchoolName && (

                        <Chip

                          label={`Name: "${searchSchoolName}"`}

                          size="small"

                          onDelete={() => setSearchSchoolName('')}

                          sx={{ height: 24, fontSize: 12 }}

                        />

                      )}

                    </Stack>

                  )}

                </Box>

              )}

            </Box>



            {/* Top scrollbar — mirrors the bottom one */}

            <ScrollableTable>

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

                  {filteredSchools.map((school, i) => (

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
                            label={safeFilter(admins, a => {
                              const ids = Array.isArray(a.schoolIds) ? a.schoolIds : a.schoolId ? [a.schoolId] : [];
                              return ids.includes(school.id);
                            }).length > 0 ? 'Active' : 'Pre-populated'}
                            color={safeFilter(admins, a => {
                              const ids = Array.isArray(a.schoolIds) ? a.schoolIds : a.schoolId ? [a.schoolId] : [];
                              return ids.includes(school.id);
                            }).length > 0 ? 'success' : 'default'}
                          size="small"

                        />

                      </TableCell>

                      <TableCell align="right">

                        <IconButton onClick={() => openSchoolDialog(school)}><EditIcon /></IconButton>

                        <IconButton onClick={() => handleDeleteSchool(school.id)} color="error"><DeleteIcon /></IconButton>

                      </TableCell>

                    </TableRow>

                  ))}

                  {filteredSchools.length === 0 && (

                    <TableRow>

                      <TableCell colSpan={8} align="center">

                        <Typography color="text.secondary">

                          {schools.length === 0 ? 'No schools found.' : 'No schools match the selected filters.'}

                        </Typography>

                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </ScrollableTable>

          </CardContent>

        </Card>

      )}



      {/* Admins tab */}

      {activeTab === 'admins' && (

        <Card>

          <CardContent>

            <Box sx={{ mb: 3 }}>

              {/* ── Row 1: Title + action buttons ── */}

              <Stack

                direction={{ xs: 'column', sm: 'row' }}

                justifyContent="space-between"

                alignItems={{ xs: 'flex-start', sm: 'center' }}

                spacing={1.5}

                sx={{ mb: showFilter ? 2 : 0 }}

              >

                <Stack direction="row" spacing={1.5} alignItems="center">

                  <Typography variant="h6" fontWeight={600}>

                    Administrator Management

                  </Typography>

                  {(filterProvince || filterRegion || searchSchoolName) && (

                    <Chip

                      label={`${[filterProvince, filterRegion, searchSchoolName].filter(Boolean).length} filter${[filterProvince, filterRegion, searchSchoolName].filter(Boolean).length > 1 ? 's' : ''} active`}

                      size="small"

                      color="primary"

                      variant="outlined"

                      sx={{ height: 22, fontSize: 11 }}

                    />

                  )}

                </Stack>



                <Button

                  variant="contained"

                  startIcon={<AddIcon fontSize="small" />}

                  onClick={() => openAdminDialog(null)}

                  sx={{ minHeight: 40, borderRadius: 2, fontWeight: 600 }}

                >

                  Add Administrator

                </Button>

              </Stack>



              {/* ── Row 2: Filters (National / Master only) ── */}

              {showFilter && (

                <Box

                  sx={{

                    p: 2,

                    borderRadius: 2,

                    bgcolor: 'grey.50',

                    border: '1px solid',

                    borderColor: 'grey.200',

                  }}

                >

                  <Stack

                    direction="row"

                    spacing={0.75}

                    alignItems="center"

                    sx={{ mb: 1.5 }}

                  >

                    <FilterListIcon sx={{ fontSize: 16, color: 'text.secondary' }} />

                    <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.5} textTransform="uppercase">

                      Filters

                    </Typography>

                  </Stack>



                  <Stack

                    direction={{ xs: 'column', sm: 'row' }}

                    spacing={1.5}

                    alignItems={{ xs: 'stretch', sm: 'center' }}

                    flexWrap="wrap"

                    useFlexGap

                  >

                    {/* Province */}

                    <FormControl size="small" sx={{ minWidth: 180, flex: '0 0 auto' }}>

                      <InputLabel>Province</InputLabel>

                      <Select

                        value={filterProvince}

                        label="Province"

                        onChange={(e) => { setFilterProvince(e.target.value); setFilterRegion(''); }}

                        sx={{ borderRadius: 2, bgcolor: 'background.paper' }}

                      >

                        <MenuItem value="">All Provinces</MenuItem>

                        {filterProvinceOptions.map((p) => (

                          <MenuItem key={p} value={p}>{p}</MenuItem>

                        ))}

                      </Select>

                    </FormControl>



                    {/* Region */}

                    <FormControl

                      size="small"

                      sx={{ minWidth: 220, flex: '0 0 auto' }}

                      disabled={!filterProvince || loadingFilterRegions}

                    >

                      <InputLabel>

                        {loadingFilterRegions ? 'Loading regions…' : 'Region'}

                      </InputLabel>

                      <Select

                        value={filterRegion}

                        label={loadingFilterRegions ? 'Loading regions…' : 'Region'}

                        onChange={(e) => setFilterRegion(e.target.value)}

                        sx={{ borderRadius: 2, bgcolor: 'background.paper' }}

                      >

                        <MenuItem value="">All Regions</MenuItem>

                        {filterRegionOptions.map((r) => {

                          const val = typeof r === 'object' ? r.name : r;

                          const key = typeof r === 'object' ? r.id : r;

                          return <MenuItem key={key} value={val}>{val}</MenuItem>;

                        })}

                      </Select>

                    </FormControl>



                    {/* Clear all */}

                    {(filterProvince || filterRegion) && (

                      <Button

                        size="small"

                        variant="text"

                        color="inherit"

                        onClick={() => { setFilterProvince(''); setFilterRegion(''); }}

                        startIcon={<ClearIcon fontSize="small" />}

                        sx={{

                          color: 'text.secondary',

                          fontWeight: 600,

                          fontSize: 13,

                          px: 1.5,

                          borderRadius: 2,

                          whiteSpace: 'nowrap',

                          flex: '0 0 auto',

                          '&:hover': { bgcolor: 'error.50', color: 'error.main' },

                        }}

                      >

                        Clear all

                      </Button>

                    )}

                  </Stack>



                  {/* Active filter chips */}

                  {(filterProvince || filterRegion || searchSchoolName) && (

                    <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>

                      {filterProvince && (

                        <Chip

                          label={`Province: ${filterProvince}`}

                          size="small"

                          onDelete={() => setFilterProvince('')}

                          sx={{ height: 24, fontSize: 12 }}

                        />

                      )}

                      {filterRegion && (

                        <Chip

                          label={`Region: ${filterRegion}`}

                          size="small"

                          onDelete={() => setFilterRegion('')}

                          sx={{ height: 24, fontSize: 12 }}

                        />

                      )}

                      {searchSchoolName && (

                        <Chip

                          label={`Name: "${searchSchoolName}"`}

                          size="small"

                          onDelete={() => setSearchSchoolName('')}

                          sx={{ height: 24, fontSize: 12 }}

                        />

                      )}

                    </Stack>

                  )}

                </Box>

              )}

            </Box>



            <ScrollableTable>

              <Table>

                <TableHead>

                  <TableRow>

                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Schools</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {filteredAdmins.map((admin, i) => {

                    const adminSchoolIds = Array.isArray(admin.schoolIds) ? admin.schoolIds
                      : admin.schoolId ? [admin.schoolId]
                      : admin.school?.id ? [admin.school.id]
                      : [];
                    const schoolNames = adminSchoolIds
                      .map(id => schools.find(s => s.id === id)?.name)
                      .filter(Boolean);
                    const schoolName = schoolNames.length
                      ? schoolNames.join(', ')
                      : admin.school?.name || admin.schoolName || 'Unknown School';

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

                  {filteredAdmins.length === 0 && (

                    <TableRow>

                      <TableCell colSpan={7} align="center">

                        <Typography color="text.secondary">

                          {admins.length === 0

                            ? 'No administrators found. Click "Add Administrator" to create one.'

                            : 'No administrators match the selected filters.'}

                        </Typography>

                      </TableCell>

                    </TableRow>

                  )}

                </TableBody>

              </Table>

            </ScrollableTable>

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

          <Autocomplete
            multiple
            fullWidth
            options={safeFilter(schools, s => s && (!isProvincialSuperAdmin() || s.province === currentUserProvinceName))}
            getOptionLabel={(option) => `${option.name}${!isProvincialSuperAdmin() ? ` (${option.province || 'No province'})` : ''}`}
            value={schools.filter(s => adminForm.schoolIds.includes(s.id))}
            onChange={(e, newValues) => {
              setAdminForm({ ...adminForm, schoolIds: newValues.map(v => v.id) });
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
            filterOptions={(options, state) => {
              if (!state.inputValue) return options;
              return options.filter(school =>
                school.name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                school.province?.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                school.region?.toLowerCase().includes(state.inputValue.toLowerCase())
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Schools"
                required
                margin="dense"
                placeholder={adminForm.schoolIds.length ? '' : 'Type to search schools...'}
              />
            )}
            noOptionsText="No schools found"
            slotProps={{ paper: { sx: { maxHeight: 300 } } }}
          />

          {/* Auto-assigned province & region from selected school */}

          {adminForm.schoolIds?.length > 0 && (() => {
            const selectedSchools = schools.filter(s => adminForm.schoolIds.includes(s.id));
            const provinces = [...new Set(selectedSchools.map(s => s.province).filter(Boolean))];
            const regions = [...new Set(selectedSchools.map(s => s.region).filter(Boolean))];
            return (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Province(s)" fullWidth margin="dense"
                  value={provinces.join(', ') || ''}
                  disabled
                  helperText="Auto-assigned from school(s)"
                />
                <TextField
                  label="Region(s)" fullWidth margin="dense"
                  value={regions.join(', ') || 'N/A'}
                  disabled
                  helperText="Auto-assigned from school(s)"
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