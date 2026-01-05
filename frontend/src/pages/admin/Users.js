import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { 
  Box, 
  Autocomplete,
  CircularProgress, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  School as TeacherIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import { getAllUsers, createUser, updateUser, deleteUser, getUsersByRole, searchStudents, getParentStudents, linkParentStudents } from '../../services/adminService';
import gradeService from '../../services/gradeService';
import subjectService from '../../services/subjectService';
import PageTitle from '../../components/common/PageTitle';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);

    const [selectedParents, setSelectedParents] = useState([]);
    const [newParents, setNewParents] = useState([
        { name: '', lastName: '', email: '', phoneNumber: '' }
    ]);

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearchInput, setStudentSearchInput] = useState('');
    const [studentSearchOptions, setStudentSearchOptions] = useState([]);
    const [studentSearchLoading, setStudentSearchLoading] = useState(false);
    
    // Form state
    const [userForm, setUserForm] = useState({
        name: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        role: '',
        subjects: [],
        grade: '',
        schoolId: '',
        parentName: '',
        parentLastName: '',
        parentPhoneNumber: '',
        parentEmail: '',
    });

    const roles = [
        { value: 'student', label: 'Student' },
        { value: 'parent', label: 'Parent' },
        { value: 'teacher', label: 'Teacher' },
    ];

    const addNewParent = () => {
        setNewParents((prev) => [...prev, { name: '', lastName: '', email: '', phoneNumber: '' }]);
    };

    const removeNewParent = (indexToRemove) => {
        setNewParents((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const updateNewParent = (indexToUpdate, key, value) => {
        setNewParents((prev) =>
            prev.map((p, index) => (index === indexToUpdate ? { ...p, [key]: value } : p))
        );
    };

    const normalizePhoneNumber = (phone) => {
        if (!phone) return '';
        return phone.replace(/\D/g, '');
    };

    const findParentByPhoneNumber = (phone) => {
        const normalized = normalizePhoneNumber(phone);
        if (!normalized) return null;
        return parents.find((parent) => normalizePhoneNumber(parent.phoneNumber) === normalized) || null;
    };

    useEffect(() => {
        fetchUsers();
        loadGrades();
        loadSubjects();
    }, []);

    useEffect(() => {
        if (userForm.role !== 'parent') return;
        const query = (studentSearchInput || '').trim();
        if (!query) {
            setStudentSearchOptions([]);
            setStudentSearchLoading(false);
            return;
        }

        setStudentSearchLoading(true);
        const timer = setTimeout(() => {
            searchStudents(query)
                .then((results) => setStudentSearchOptions(Array.isArray(results) ? results : []))
                .catch(() => setStudentSearchOptions([]))
                .finally(() => setStudentSearchLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [studentSearchInput, userForm.role]);

    const loadGrades = async () => {
        try {
            const gradesData = await gradeService.getSchoolGrades();
            setGrades(gradesData);
        } catch (error) {
            console.error('Failed to load grades:', error);
        }
    };

    const loadSubjects = async () => {
        try {
            const subjectsData = await subjectService.getSchoolSubjects();
            setSubjects(subjectsData || []);
        } catch (error) {
            console.warn('Subjects endpoint not available, using fallback data:', error.message);
            // Provide fallback subject data until backend implements the endpoint
            setSubjects([
                { id: 1, name: 'Mathematics' },
                { id: 2, name: 'English' },
                { id: 3, name: 'Science' },
                { id: 4, name: 'History' },
                { id: 5, name: 'Geography' }
            ]);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const [allUsersData, parentsData, teachersData, studentsData] = await Promise.all([
                getAllUsers(),
                getUsersByRole('parent'),
                getUsersByRole('teacher'),
                getUsersByRole('student')
            ]);
            setUsers(allUsersData);
            setParents(parentsData || []);
            setTeachers(teachersData || []);
            setStudents(studentsData || []);
        } catch (err) {
            setError('Failed to load users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Normalize role to lowercase before submission
    const normalizeRole = (role) => {
        if (!role) return 'student';
        return role.toLowerCase();
    };

    const handleSubmit = async () => {
        // Reset previous errors
        setFormErrors({});
        setError('');
        
        // Validation
        const errors = {};
        
        if (!userForm.name.trim()) {
            errors.name = true;
        }
        
        if (!userForm.email.trim()) {
            errors.email = true;
        } else {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userForm.email)) {
                errors.email = true;
            }
        }
        

        if (userForm.role !== 'student') {
            // For parent/teacher, keep phone required
            if (!userForm.phoneNumber.trim()) {
                errors.phoneNumber = true;
            } else {
                const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                if (!phoneRegex.test(userForm.phoneNumber)) {
                    errors.phoneNumber = true;
                }
            }
        } else {
            // For students, phone can be null. Validate only when provided.
            const studentPhone = userForm.phoneNumber.trim();
            if (studentPhone) {
                const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                if (!phoneRegex.test(studentPhone)) {
                    errors.phoneNumber = true;
                }
            }

            // Student must have a username
            if (!userForm.username.trim()) {
                errors.username = true;
            }

            // Student must have a grade selected
            if (!userForm.grade) {
                errors.grade = true;
            }

            const selectedParentCount = selectedParents.length;
            const validNewParentCount = newParents.filter((p) => p.phoneNumber?.trim()).length;
            const fallbackParentPhone = userForm.parentPhoneNumber?.trim() || '';

            if (!editingUser && selectedParentCount === 0 && validNewParentCount === 0 && !fallbackParentPhone) {
                errors.parentPhoneNumber = true;
            }
        }

        if (userForm.role === 'teacher') {
            if (!userForm.grade) {
                errors.grade = true;
            }
            if (!Array.isArray(userForm.subjects) || userForm.subjects.length === 0) {
                errors.subjects = true;
            }
        }



        
        if (!userForm.role) {
            errors.role = true;
        }
        
        // If there are errors, set them and return
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setError('Please fix the errors above');
            return;
        }
        
        // Normalize form data before submission
        const primarySelectedParent = selectedParents[0] || null;
        const primaryNewParent = newParents.find((p) => p.phoneNumber?.trim()) || null;

        const formData = {
            ...userForm,
            role: normalizeRole(userForm.role),
            parentName: primarySelectedParent?.name || primaryNewParent?.name || userForm.parentName,
            parentLastName: primarySelectedParent?.lastName || primaryNewParent?.lastName || userForm.parentLastName,
            parentEmail: primarySelectedParent?.email || primaryNewParent?.email || userForm.parentEmail,
            parentPhoneNumber: primarySelectedParent?.phoneNumber || primaryNewParent?.phoneNumber || userForm.parentPhoneNumber,
        };

        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
            } else {
                const created = await createUser(formData);
                const roleLower = (formData.role || '').toString().toLowerCase();
                const createdId = created?.id || created?.user?.id || created?.data?.id;
                if (roleLower === 'parent' && createdId && selectedStudents.length > 0) {
                    const studentIds = selectedStudents
                        .map((s) => s?.id)
                        .filter((id) => id !== null && id !== undefined);

                    if (studentIds.length > 0) {
                        try {
                            await linkParentStudents(createdId, studentIds);
                        } catch (linkErr) {
                            console.error('Failed to link parent to students:', linkErr);
                        }
                    }
                }
            }
            setDialogOpen(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Failed to save user: ' + (err.response?.data?.message || err.message));
            console.error(err);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user');
                console.error(err);
            }
        }
    };

    const openDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                name: user.name || '',
                lastName: user.lastName || '',
                username: user.username || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                role: normalizeRole(user.role) || '',
                subjects: user.subjects || [],
                grade: user.grade || '',
                schoolId: user.schoolId || '',
                parentName: user.parentName || '',
                parentLastName: user.parentLastName || '',
                parentPhoneNumber: user.parentPhoneNumber || '',
                parentEmail: user.parentEmail || '',
            });
        } else {
            setEditingUser(null);
            resetForm();
        }
        setSelectedParents([]);
        setNewParents([{ name: '', lastName: '', email: '', phoneNumber: '' }]);
        setSelectedStudents([]);
        setStudentSearchInput('');
        setStudentSearchOptions([]);
        setFormErrors({});
        setError('');
        setDialogOpen(true);

        const roleLower = normalizeRole(user?.role);
        if (user && roleLower === 'parent' && user.id) {
            getParentStudents(user.id)
                .then((data) => setSelectedStudents(Array.isArray(data) ? data : []))
                .catch(() => setSelectedStudents([]));
        }
    };

    const resetForm = () => {
        setUserForm({
            name: '',
            lastName: '',
            username: '',
            email: '',
            phoneNumber: '',
            role: '',
            subjects: [],
            grade: '',
            parentName: '',
            parentLastName: '',
            parentPhoneNumber: '',
            parentEmail: '',
        });
        setSelectedParents([]);
        setNewParents([{ name: '', lastName: '', email: '', phoneNumber: '' }]);
        setSelectedStudents([]);
        setStudentSearchInput('');
        setStudentSearchOptions([]);
        setFormErrors({});
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleExport = (data, title) => {
        if (!data || data.length === 0) {
            setError('No data to export.');
            return;
        }

        // Define headers based on the table
        const headers = ['Name', 'Last Name', 'Email', 'Phone Number', 'Role'];
        const isTeachersTable = title === 'Teachers';
        if (isTeachersTable) {
            headers.push('Subjects', 'Grade');
        }

        const csvData = data.map(user => {
            const row = {
                'Name': user.name,
                'Last Name': user.lastName || 'N/A',
                'Email': user.email,
                'Phone Number': user.phoneNumber,
                'Role': user.role,
            };
            if (isTeachersTable) {
                row['Subjects'] = user.subjects?.join(', ') || 'Not assigned';
                row['Grade'] = user.grade || 'Not assigned';
            }
            return row;
        });

        const csv = Papa.unparse(csvData, { header: true, columns: headers });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const fileName = `${title.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`;
        saveAs(blob, fileName);
    };

    const downloadBulkUploadTemplate = () => {
        const headers = [
            'role',
            'name',
            'lastName',
            'email',
            'phoneNumber',
            'username',
            'grade',
            'subjects',
            'parentName',
            'parentLastName',
            'parentPhoneNumber',
            'parentEmail'
        ];

        const sampleRows = [
            {
                role: 'STUDENT',
                name: 'TheStudent',
                lastName: 'Surname',
                email: 'student@gmail.com',
                phoneNumber: '0761234567',
                username: 'ST10283',
                grade: '8',
                subjects: '',
                parentName: 'Name',
                parentLastName: 'Surname',
                parentPhoneNumber: '0765078112',
                parentEmail: 'guard@gmail.com'
            }
        ];

        const csv = Papa.unparse(sampleRows, { header: true, columns: headers });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `user_bulk_upload_template_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'teacher': return 'primary';
            case 'parent': return 'secondary';
            case 'student': return 'success';
            default: return 'default';
        }
    };

    const renderUserTable = (userData, title, canCreateRole = true) => {
        // Safety check: ensure userData is always an array
        const safeUserData = Array.isArray(userData) ? userData : [];
        
        return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{title}</Typography>
                    <Box>
                        {canCreateRole && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    const roleMap = {
                                        'All Users': 'student',
                                        'Parents': 'parent',
                                        'Students': 'student',
                                        'Teachers': 'teacher'
                                    };
                                    const selectedRole = roleMap[title] || 'student';
                                    
                                    // Reset form and set the role
                                    resetForm();
                                    setUserForm(prev => ({ ...prev, role: selectedRole }));
                                    setEditingUser(null);
                                    setFormErrors({});
                                    setError('');
                                    setDialogOpen(true);
                                }}
                                sx={{ mr: 1 }}
                            >
                                Add {title === 'All Users' ? 'User' : title.slice(0, -1)}
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={() => setBulkUploadDialogOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            Bulk Upload (Coming Soon)
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExport(userData, title)}
                        >
                            Export CSV
                        </Button>
                    </Box>
                </Box>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Role</TableCell>
                                {title === 'Teachers' && <TableCell>Subjects</TableCell>}
                                {title === 'Teachers' && <TableCell>Grade</TableCell>}
                                {title === 'Students' && <TableCell>Grade</TableCell>}
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {safeUserData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary">
                                            No {title.toLowerCase()} found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                safeUserData.map((user) => {
                                    // For teachers: resolve subject and grade IDs to names
                                    let subjectNames = [];
                                    let gradeName = 'Not assigned';
                                    
                                    if (title === 'Teachers') {
                                        // Convert subject IDs to names
                                        if (Array.isArray(user.subjects) && user.subjects.length > 0) {
                                            subjectNames = user.subjects
                                                .map(subjectId => {
                                                    const subject = subjects.find(s => String(s.id) === String(subjectId));
                                                    return subject ? subject.name : null;
                                                })
                                                .filter(Boolean); // Remove null values
                                        }
                                        
                                        // Convert grade ID to name
                                        if (user.grade) {
                                            const grade = grades.find(g => String(g.id) === String(user.grade));
                                            gradeName = grade ? grade.name : 'Not assigned';
                                        }
                                    }
                                    
                                    // For students: resolve grade ID to name
                                    let studentGradeName = 'Not assigned';
                                    if (title === 'Students' && user.grade) {
                                        const grade = grades.find(g => String(g.id) === String(user.grade));
                                        studentGradeName = grade ? grade.name : 'Not assigned';
                                    }
                                    
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.lastName || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phoneNumber}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={user.role} 
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            {title === 'Teachers' && (
                                                <TableCell>
                                                    {subjectNames.length > 0 ? subjectNames.join(', ') : 'Not assigned'}
                                                </TableCell>
                                            )}
                                            {title === 'Teachers' && (
                                                <TableCell>{gradeName}</TableCell>
                                            )}
                                            {title === 'Students' && (
                                                <TableCell>{studentGradeName}</TableCell>
                                            )}
                                            <TableCell align="right">
                                                <IconButton onClick={() => openDialog(user)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(user.id)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
        );
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ width: '100%', p: 0, m: 0 }}>
            <PageTitle title="User Management" subtitle="Manage users, administrators, and teachers in your school." />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {users.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Total Users
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AdminIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {parents.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Parents
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TeacherIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {teachers.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Teachers
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {students.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Students
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="All Users" />
                    <Tab label="Parents" />
                    <Tab label="Teachers" />
                    <Tab label="Students" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            {activeTab === 0 && renderUserTable(users, 'All Users')}
            {activeTab === 1 && renderUserTable(parents, 'Parents')}
            {activeTab === 2 && renderUserTable(teachers, 'Teachers')}
            {activeTab === 3 && renderUserTable(students, 'Students')}

            {/* User Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="First Name"
                        fullWidth
                        variant="outlined"
                        value={userForm.name}
                    onChange={(e) => {
                        setUserForm({ ...userForm, name: e.target.value });
                        setFormErrors({ ...formErrors, name: false });
                    }}
                    error={formErrors.name}
                    helperText={formErrors.name ? 'Name is required' : ''}
                    required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        fullWidth
                        variant="outlined"
                        value={userForm.lastName}
                        onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={userForm.email}
                    onChange={(e) => {
                        setUserForm({ ...userForm, email: e.target.value });
                        setFormErrors({ ...formErrors, email: false });
                    }}
                    error={formErrors.email}
                    helperText={formErrors.email ? 'Please enter a valid email address' : ''}
                    required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Phone Number"
                        fullWidth
                        variant="outlined"
                        value={userForm.phoneNumber}
                    onChange={(e) => {
                        setUserForm({ ...userForm, phoneNumber: e.target.value });
                        setFormErrors({ ...formErrors, phoneNumber: false });
                    }}
                    error={formErrors.phoneNumber}
                    helperText={formErrors.phoneNumber ? 'Phone number is required' : ''}
                    required={userForm.role !== 'student'}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Role"
                        fullWidth
                        variant="outlined"
                        value={userForm.role}
                        onChange={(e) => {
                            setUserForm({ ...userForm, role: e.target.value });
                            setFormErrors({ ...formErrors, role: false });

                            const nextRole = (e.target.value || '').toString().toLowerCase();
                            if (nextRole !== 'parent') {
                                setSelectedStudents([]);
                                setStudentSearchInput('');
                                setStudentSearchOptions([]);
                            }
                        }}
                        error={formErrors.role}
                        helperText={editingUser ? 'Role cannot be changed after creation' : (formErrors.role ? 'Role is required' : '')}
                        required
                        disabled={!!editingUser} // Disable role field when editing
                        sx={{ mb: 2 }}
                    >
                        {roles.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                                {role.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {userForm.role === 'parent' && (
                        <Autocomplete
                            multiple
                            options={studentSearchOptions || []}
                            value={selectedStudents}
                            loading={studentSearchLoading}
                            inputValue={studentSearchInput}
                            onInputChange={(event, newInputValue) => {
                                setStudentSearchInput(newInputValue);
                            }}
                            onChange={(event, newValue) => {
                                setSelectedStudents(newValue || []);
                            }}
                            filterOptions={(x) => x}
                            isOptionEqualToValue={(option, value) => String(option?.id) === String(value?.id)}
                            getOptionLabel={(option) => {
                                const username = option?.username ? `${option.username} ` : '';
                                const first = option?.name || '';
                                const last = option?.lastName || '';
                                const grade = option?.grade?.name || option?.grade || option?.gradeId;
                                const nameLabel = `${first} ${last}`.trim();
                                const gradeLabel = grade ? ` • ${grade}` : '';
                                return `${username}${nameLabel}${gradeLabel}`.trim();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="dense"
                                    label="Link Student(s)"
                                    placeholder="Search by username, name, or surname"
                                    variant="outlined"
                                    helperText="Select one or more students to link to this parent"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {studentSearchLoading ? <CircularProgress color="inherit" size={18} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        )
                                    }}
                                />
                            )}
                            sx={{ mb: 2 }}
                        />
                    )}
                    
                    {(userForm.role === 'teacher' || userForm.role === 'student') && (
                        <>
                            <TextField
                                select
                                margin="dense"
                                label="Subjects"
                                fullWidth
                                variant="outlined"
                                value={userForm.subjects}
                                onChange={(e) => setUserForm({ ...userForm, subjects: e.target.value })}
                                SelectProps={{
                                    multiple: true,
                                }}
                                error={formErrors.subjects}
                                helperText={formErrors.subjects ? 'At least one subject is required for teachers' : ''}
                                sx={{ mb: 2 }}
                            >
                                {subjects.map((subject) => (
                                    <MenuItem key={subject.id} value={subject.id}> {/* Changed from subject.name to subject.id */}
                                        {subject.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                margin="dense"
                                label="Grade"
                                fullWidth
                                variant="outlined"
                                value={userForm.grade}
                                onChange={(e) => setUserForm({ ...userForm, grade: e.target.value })}
                                error={formErrors.grade}
                                helperText={formErrors.grade ? 'Grade is required' : ''}
                                sx={{ mb: 2 }}
                            >
                                {grades.map((grade) => {
                                    const gradeValue = grade.id;
                                    return (
                                            <MenuItem key={grade.id} value={gradeValue}>
                                                {grade.name}
                                            </MenuItem>
                                    );
                                })}
                            </TextField>
                        </>
                    )}

                    {userForm.role === 'student' && (
                        <>
                            <TextField
                            margin="dense"
                            label="Username"
                            fullWidth
                            variant="outlined"
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            error={formErrors.username}
                            helperText={formErrors.username ? 'Username is required for students' : ''}
                            sx={{ mb: 2 }}
                            />

                            <Autocomplete
                                multiple
                                options={parents || []}
                                value={selectedParents}
                                onChange={(event, newValue) => {
                                    setSelectedParents(newValue || []);
                                    if (!editingUser) {
                                        setFormErrors({ ...formErrors, parentPhoneNumber: false });
                                    }
                                }}
                                getOptionLabel={(option) => {
                                    const first = option?.name || '';
                                    const last = option?.lastName || '';
                                    const phone = option?.phoneNumber || '';
                                    return `${first} ${last}`.trim() + (phone ? ` (${phone})` : '');
                                }}
                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        margin="dense"
                                        label="Select Existing Parent(s)"
                                        placeholder="Search existing parents by name or phone"
                                        variant="outlined"
                                        error={formErrors.parentPhoneNumber}
                                        helperText={formErrors.parentPhoneNumber ? 'At least one parent/guardian is required for students' : 'Selecting an existing parent will link them to this student (no duplicate parent record).'}
                                    />
                                )}
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">Add New Parent(s)</Typography>
                                <Button size="small" onClick={addNewParent} startIcon={<AddIcon />}>
                                    Add Parent
                                </Button>
                            </Box>

                            {newParents.map((p, index) => (
                                <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2">Parent {index + 1}</Typography>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => removeNewParent(index)}
                                            disabled={newParents.length === 1}
                                        >
                                            Remove
                                        </Button>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                margin="dense"
                                                label="First Name"
                                                fullWidth
                                                variant="outlined"
                                                value={p.name}
                                                onChange={(e) => updateNewParent(index, 'name', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                margin="dense"
                                                label="Last Name"
                                                fullWidth
                                                variant="outlined"
                                                value={p.lastName}
                                                onChange={(e) => updateNewParent(index, 'lastName', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                margin="dense"
                                                label="Email"
                                                fullWidth
                                                variant="outlined"
                                                value={p.email}
                                                onChange={(e) => updateNewParent(index, 'email', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                margin="dense"
                                                label="Phone Number"
                                                fullWidth
                                                variant="outlined"
                                                value={p.phoneNumber}
                                                onChange={(e) => updateNewParent(index, 'phoneNumber', e.target.value)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                For now, the backend only links one parent. The first selected parent (or first new parent with a phone) will be sent as the primary parent.
                            </Typography>

                            <TextField
                            margin="dense"
                            label="Parent/Guardian First Name"
                            fullWidth
                            variant="outlined"
                            value={userForm.parentName}
                            onChange={(e) => setUserForm({ ...userForm, parentName: e.target.value })}
                            sx={{ mb: 2 }}
                            />
                            <TextField
                            margin="dense"
                            label="Parent/Guardian Last Name"
                            fullWidth
                            variant="outlined"
                            value={userForm.parentLastName}
                            onChange={(e) => setUserForm({ ...userForm, parentLastName: e.target.value })}
                            sx={{ mb: 2 }}
                            />
                            <TextField
                            margin="dense"
                            label="Parent/Guardian Email"
                            fullWidth
                            variant="outlined"
                            value={userForm.parentEmail}
                            onChange={(e) => setUserForm({ ...userForm, parentEmail: e.target.value })}
                            sx={{ mb: 2 }}
                            />
                            <TextField
                            margin="dense"
                            label="Parent/Guardian Phone Number"
                            fullWidth
                            variant="outlined"
                            value={userForm.parentPhoneNumber}
                            onChange={(e) => {
                                const newPhone = e.target.value;
                                setUserForm((prev) => {
                                    const updatedForm = { ...prev, parentPhoneNumber: newPhone };
                                    const matchedParent = findParentByPhoneNumber(newPhone);
                                    if (matchedParent) {
                                        updatedForm.parentName = matchedParent.name || updatedForm.parentName;
                                        updatedForm.parentLastName = matchedParent.lastName || updatedForm.parentLastName;
                                        updatedForm.parentEmail = matchedParent.email || updatedForm.parentEmail;
                                    }
                                    return updatedForm;
                                });
                                setFormErrors({ ...formErrors, parentPhoneNumber: false });
                            }}
                            error={formErrors.parentPhoneNumber}
                            helperText={formErrors.parentPhoneNumber ? 'Parent/guardian phone number is required for students' : ''}
                            sx={{ mb: 2 }}
                            />
                        </>
                        )}
                    
                    
                    {/* Password removed - users authenticate with OTP */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={bulkUploadDialogOpen} onClose={() => setBulkUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Upload Users (Coming Soon)</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Bulk uploads are being added to support a smooth transition. For now, you can download a CSV template.
                    </Alert>
                    <TextField
                        fullWidth
                        disabled
                        label="Upload CSV"
                        margin="dense"
                        placeholder="Coming soon"
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkUploadDialogOpen(false)}>Close</Button>
                    <Button variant="outlined" onClick={downloadBulkUploadTemplate}>
                        Download CSV Template
                    </Button>
                    <Button variant="contained" disabled startIcon={<UploadFileIcon />}>
                        Upload (Coming Soon)
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
