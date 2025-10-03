import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth';
import Logo from '../../assets/Logo.png';

const SuperAdminRegister = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    province: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  // South African provinces
  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value === 'SUPERADMIN_NATIONAL' ? { province: '' } : {})
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };
  

  const validateForm = () => {
    if (!formData.phoneNumber || !formData.name || !formData.lastName || 
        !formData.email || !formData.password || !formData.role) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.role === 'SUPERADMIN_PROVINCIAL' && !formData.province) {
      setError('Province is required for Provincial Super Admin');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Basic phone number validation (South African format)
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Please enter a valid South African phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'SUPERADMIN_PROVINCIAL' && { province: formData.province })
      };

      const response = await authService.superAdminRegister(registrationData);
      setSuccess('Registration successful! You can now login with your credentials.');
      
      // Clear form
      setFormData({
        phoneNumber: '',
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        province: ''
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/superadmin/login');
      }, 2000);

    } catch (err) {
      // Handle specific error responses from backend
      if (err.response?.data) {
        const { status, message } = err.response.data;
        
        switch (status) {
          case 409:
          case 400:
            if (message?.includes('email already exists') || message?.includes('SuperAdmin with this email already exists')) {
              setError('An account with this email already exists. Please use a different email.');
            } else {
              setError(message || 'Please check your input data and try again.');
            }
            break;
          case 422:
            setError(message || 'Please check that all required fields are filled correctly.');
            break;
          case 500:
            setError('Server error occurred. Please try again later.');
            break;
          default:
            setError(message || 'Registration failed. Please try again.');
        }
      } else {
        // Fallback for network errors or unexpected format
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <img 
            src={Logo} 
            alt="Thuto" 
            style={{ 
              height: '80px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </Box>
        
        <Typography variant="h4" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Super Admin Registration
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              required
              fullWidth
              label="First Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              required
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </Box>

          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
            placeholder="e.g., +27123456789 or 0123456789"
            helperText="Enter South African phone number"
          />

          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              label="Role"
            >
              <MenuItem value="SUPERADMIN_NATIONAL">National Super Admin</MenuItem>
              <MenuItem value="SUPERADMIN_PROVINCIAL">Provincial Super Admin</MenuItem>
            </Select>
            <FormHelperText>
              National admins have access to all provinces, Provincial admins are restricted to one province
            </FormHelperText>
          </FormControl>

          {formData.role === 'SUPERADMIN_PROVINCIAL' && (
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Province</InputLabel>
              <Select
                name="province"
                value={formData.province}
                onChange={handleChange}
                disabled={loading}
                label="Province"
              >
                {provinces.map((province) => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            required
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
            helperText="Minimum 6 characters"
          />

          <TextField
            required
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/superadmin/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SuperAdminRegister;
