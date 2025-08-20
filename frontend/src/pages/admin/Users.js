import React, { useState, useEffect } from 'react';
import { 
  Box, 
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
  School as TeacherIcon
} from '@mui/icons-material';
import { getAllUsers, createUser, updateUser, deleteUser, getUsersByRole } from '../../services/adminService';
import PageTitle from '../../components/common/PageTitle';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    // Form state
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        role: 'student',
        password: '',
        subjects: [],
        grade: ''
    });

    const roles = [
        { value: 'student', label: 'Student' },
        { value: 'parent', label: 'Parent' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'admin', label: 'Administrator' }
    ];

    const subjects = [
        'Mathematics', 'English', 'Science', 'History', 'Geography', 
        'Physics', 'Chemistry', 'Biology', 'Art', 'Music', 'Physical Education'
    ];

    const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const [allUsersData, adminsData, teachersData] = await Promise.all([
                getAllUsers(),
                getUsersByRole('admin'),
                getUsersByRole('teacher')
            ]);
            setUsers(allUsersData);
            setAdmins(adminsData);
            setTeachers(teachersData);
        } catch (err) {
            setError('Failed to load users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, userForm);
            } else {
                await createUser(userForm);
            }
            setDialogOpen(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
        } catch (err) {
            setError('Failed to save user');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user');
            }
        }
    };

    const openDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                role: user.role || 'student',
                password: '',
                subjects: user.subjects || [],
                grade: user.grade || ''
            });
        } else {
            setEditingUser(null);
            resetForm();
        }
        setDialogOpen(true);
    };

    const resetForm = () => {
        setUserForm({
            name: '',
            email: '',
            phoneNumber: '',
            role: 'student',
            password: '',
            subjects: [],
            grade: ''
        });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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

    const renderUserTable = (userData, title, canCreateRole = true) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{title}</Typography>
                    {canCreateRole && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                const roleMap = {
                                    'All Users': 'student',
                                    'Administrators': 'admin',
                                    'Teachers': 'teacher'
                                };
                                setUserForm({ ...userForm, role: roleMap[title] || 'student' });
                                openDialog();
                            }}
                        >
                            Add {title === 'All Users' ? 'User' : title.slice(0, -1)}
                        </Button>
                    )}
                </Box>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Role</TableCell>
                                {title === 'Teachers' && <TableCell>Subjects</TableCell>}
                                {title === 'Teachers' && <TableCell>Grade</TableCell>}
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userData.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
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
                                            {user.subjects?.join(', ') || 'Not assigned'}
                                        </TableCell>
                                    )}
                                    {title === 'Teachers' && (
                                        <TableCell>{user.grade || 'Not assigned'}</TableCell>
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
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );

    if (loading) return <CircularProgress />;

    return (
        <Box>
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
                                        {admins.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Administrators
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
                                        {users.filter(u => u.role === 'student').length}
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
                    <Tab label="Administrators" />
                    <Tab label="Teachers" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            {activeTab === 0 && renderUserTable(users, 'All Users')}
            {activeTab === 1 && renderUserTable(admins, 'Administrators')}
            {activeTab === 2 && renderUserTable(teachers, 'Teachers')}

            {/* User Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Full Name"
                        fullWidth
                        variant="outlined"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Phone Number"
                        fullWidth
                        variant="outlined"
                        value={userForm.phoneNumber}
                        onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Role"
                        fullWidth
                        variant="outlined"
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        sx={{ mb: 2 }}
                    >
                        {roles.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                                {role.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    
                    {userForm.role === 'teacher' && (
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
                                sx={{ mb: 2 }}
                            >
                                {subjects.map((subject) => (
                                    <MenuItem key={subject} value={subject}>
                                        {subject}
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
                                sx={{ mb: 2 }}
                            >
                                {grades.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </>
                    )}
                    
                    <TextField
                        margin="dense"
                        label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
