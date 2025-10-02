import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { 
  getAllSuperadmins, 
  createSuperadmin, 
  updateSuperadmin, 
  deleteSuperadmin 
} from '../../services/masterService';

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const SuperadminManagement = () => {
  const [superadmins, setSuperadmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSuperadmin, setSelectedSuperadmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'superadmin_provincial', // Default role
    province: '',
    password: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchSuperadmins();
  }, []);

  const fetchSuperadmins = async () => {
    try {
      setLoading(true);
      const data = await getAllSuperadmins();
      setSuperadmins(data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch superadmins', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (superadmin = null) => {
    if (superadmin) {
      setEditMode(true);
      setSelectedSuperadmin(superadmin);
      setFormData({
        name: superadmin.name,
        email: superadmin.email,
        role: superadmin.role,
        province: superadmin.province || '',
        password: ''
      });
    } else {
      setEditMode(false);
      setSelectedSuperadmin(null);
      setFormData({ 
        name: '', 
        email: '', 
        role: 'superadmin_provincial',
        province: '', 
        password: '' 
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ 
      name: '', 
      email: '', 
      role: 'superadmin_provincial',
      province: '', 
      password: '' 
    });
    setSelectedSuperadmin(null);
    setEditMode(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const payload = { ...formData };
      
      // Remove password field if it's empty (edit mode)
      if (editMode && !payload.password) {
        delete payload.password;
      }
      
      if (editMode) {
        await updateSuperadmin(selectedSuperadmin.id, payload);
        enqueueSnackbar('Superadmin updated successfully', { variant: 'success' });
      } else {
        await createSuperadmin(payload);
        enqueueSnackbar('Superadmin created successfully', { variant: 'success' });
      }
      
      handleCloseDialog();
      fetchSuperadmins();
    } catch (error) {
      enqueueSnackbar(error.message || `Failed to ${editMode ? 'update' : 'create'} superadmin`, { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (superadminId) => {
    if (window.confirm('Are you sure you want to delete this superadmin?')) {
      try {
        await deleteSuperadmin(superadminId);
        enqueueSnackbar('Superadmin deleted successfully', { variant: 'success' });
        fetchSuperadmins();
      } catch (error) {
        enqueueSnackbar(error.message || 'Failed to delete superadmin', { variant: 'error' });
      }
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'superadmin_national':
        return 'National Super Admin';
      case 'superadmin_provincial':
        return 'Provincial Super Admin';
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Superadmin Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Superadmin
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Province</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : superadmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No superadmins found
                  </TableCell>
                </TableRow>
              ) : (
                superadmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleLabel(admin.role)}
                        color={admin.role === 'superadmin_national' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{admin.province || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenDialog(admin)}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(admin.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Superadmin' : 'Add New Superadmin'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
              disabled={editMode}
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ 
                  ...formData, 
                  role: e.target.value,
                  // Reset province when changing to national
                  province: e.target.value === 'superadmin_national' ? '' : formData.province
                })}
              >
                <MenuItem value="superadmin_national">National Super Admin</MenuItem>
                <MenuItem value="superadmin_provincial">Provincial Super Admin</MenuItem>
              </Select>
            </FormControl>
            
            {formData.role === 'superadmin_provincial' && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Province</InputLabel>
                <Select
                  value={formData.province}
                  label="Province"
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                >
                  {PROVINCES.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <TextField
              fullWidth
              label={editMode ? 'New Password (leave blank to keep current)' : 'Password'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required={!editMode}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading || !formData.name || !formData.email || 
                     (formData.role === 'superadmin_provincial' && !formData.province) ||
                     (!editMode && !formData.password)}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SuperadminManagement;
