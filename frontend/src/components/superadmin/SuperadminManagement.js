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
        province: superadmin.province,
        password: ''
      });
    } else {
      setEditMode(false);
      setSelectedSuperadmin(null);
      setFormData({ name: '', email: '', province: '', password: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ name: '', email: '', province: '', password: '' });
    setSelectedSuperadmin(null);
    setEditMode(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        role: 'superadmin',
        level: 'provincial'
      };

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
      enqueueSnackbar(`Failed to ${editMode ? 'update' : 'create'} superadmin`, { variant: 'error' });
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
        enqueueSnackbar('Failed to delete superadmin', { variant: 'error' });
      }
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

        <Alert severity="info" sx={{ mb: 2 }}>
          Manage provincial superadmins. Each superadmin can only access schools and data within their assigned province.
        </Alert>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Province</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {superadmins.map((superadmin) => (
                <TableRow key={superadmin.id}>
                  <TableCell>{superadmin.name}</TableCell>
                  <TableCell>{superadmin.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={superadmin.province} 
                      color="primary" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={superadmin.isActive ? 'Active' : 'Inactive'} 
                      color={superadmin.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(superadmin)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(superadmin.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editMode ? 'Edit Superadmin' : 'Create New Superadmin'}
          </DialogTitle>
          <DialogContent>
            <Box mt={1}>
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
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Province</InputLabel>
                <Select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  label="Province"
                >
                  {PROVINCES.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={editMode ? "New Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required={!editMode}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={loading}
            >
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SuperadminManagement;
