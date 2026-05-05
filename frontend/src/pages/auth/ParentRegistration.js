import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import { School as SchoolIcon, Person as PersonIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import parentService from '../../services/parentService';

const ParentRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idNumber: '',
    
    // Address Information
    address: '',
    city: '',
    province: '',
    postalCode: '',
    
    // School Information
    schoolId: '',
    relationshipToStudent: '',
    studentNames: '',
    studentGrade: '',
    
    // Role Information
    parentRole: 'parent', // parent, guardian, sponsor, helper
    helperExpiryDate: '', // For helper role only
    
    // Account Information
    password: '',
    confirmPassword: ''
  });

  const steps = [
    'Personal Information',
    'School Details',
    'Account Setup',
    'Review & Submit'
  ];

  // Fetch schools when component mounts
  React.useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoadingSchools(true);
      const response = await parentService.getPublicSchools();
      setSchools(response || []);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      // Fallback: show error but allow manual entry
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
          setError('Please fill in all required personal information fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!/^(\+27|0)[0-9]{9}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
          setError('Please enter a valid South African phone number');
          return false;
        }
        break;

      case 1: // School Details
        if (!formData.schoolId || !formData.relationshipToStudent || !formData.studentNames || !formData.parentRole) {
          setError('Please fill in all required school information fields');
          return false;
        }
        if (formData.parentRole === 'helper' && !formData.helperExpiryDate) {
          setError('Please specify the expiry date for temporary guardian access');
          return false;
        }
        break;

      case 2: // Account Setup
        if (!formData.password || !formData.confirmPassword) {
          setError('Please enter and confirm your password');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;

      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const registrationData = {
        ...formData,
        role: formData.parentRole, // Use the selected role (parent, guardian, sponsor, helper)
        status: 'pending_approval', // Requires admin approval
        registrationDate: new Date().toISOString()
      };

      const response = await parentService.registerParent(registrationData);
      
      setSuccess('Registration submitted successfully! Your account is pending admin approval. You will receive an email once approved.');
      setActiveStep(steps.length);
      
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Personal Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                placeholder="e.g. 0123456789 or +27123456789"
                value={formData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID Number"
                value={formData.idNumber}
                onChange={handleInputChange('idNumber')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Province"
                value={formData.province}
                onChange={handleInputChange('province')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={handleInputChange('postalCode')}
                disabled={loading}
              />
            </Grid>
          </Grid>
        );

      case 1: // School Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Select School</InputLabel>
                <Select
                  value={formData.schoolId}
                  onChange={handleInputChange('schoolId')}
                  label="Select School"
                >
                  {loadingSchools ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                      Loading schools...
                    </MenuItem>
                  ) : (
                    schools.map((school) => (
                      <MenuItem key={school.id} value={school.id}>
                        {school.name} - {school.province}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Relationship to Student</InputLabel>
                <Select
                  value={formData.relationshipToStudent}
                  onChange={handleInputChange('relationshipToStudent')}
                  label="Relationship to Student"
                >
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                  <MenuItem value="grandmother">Grandmother</MenuItem>
                  <MenuItem value="grandfather">Grandfather</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student Name(s)"
                placeholder="Enter the full name(s) of your child/children"
                value={formData.studentNames}
                onChange={handleInputChange('studentNames')}
                required
                disabled={loading}
                helperText="If you have multiple children at this school, please list all names separated by commas"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student Grade(s)"
                placeholder="e.g. Grade 1, Grade 3"
                value={formData.studentGrade}
                onChange={handleInputChange('studentGrade')}
                disabled={loading}
                helperText="Optional: Specify the grade(s) of your child/children"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.parentRole}
                  onChange={handleInputChange('parentRole')}
                  label="Account Type"
                >
                  <MenuItem value="parent">Parent - Full access to child's information</MenuItem>
                  <MenuItem value="guardian">Guardian - Full legal access to child's information</MenuItem>
                  <MenuItem value="sponsor">Sponsor - Can view attendance and reports only</MenuItem>
                  <MenuItem value="helper">Temporary Guardian - Limited time access</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.parentRole === 'helper' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Access Expiry Date"
                  type="date"
                  value={formData.helperExpiryDate}
                  onChange={handleInputChange('helperExpiryDate')}
                  disabled={loading}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="When will temporary access expire?"
                />
              </Grid>
            )}
          </Grid>
        );

      case 2: // Account Setup
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                disabled={loading}
                helperText="Password must be at least 8 characters long"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'info.lighter' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Important:</strong> After registration, your account will need to be approved by a school administrator. 
                  You will receive an email notification once your account is approved and you can log in.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        );

      case 3: // Review & Submit
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name:</Typography>
                  <Typography>{formData.firstName} {formData.lastName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                  <Typography>{formData.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone:</Typography>
                  <Typography>{formData.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">School:</Typography>
                  <Typography>
                    {schools.find(s => s.id === formData.schoolId)?.name || 'Selected School'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Relationship:</Typography>
                  <Typography>{formData.relationshipToStudent}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Student(s):</Typography>
                  <Typography>{formData.studentNames}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Account Type:</Typography>
                  <Typography>
                    {formData.parentRole === 'parent' && 'Parent - Full access'}
                    {formData.parentRole === 'guardian' && 'Guardian - Full legal access'}
                    {formData.parentRole === 'sponsor' && 'Sponsor - Attendance & reports only'}
                    {formData.parentRole === 'helper' && 'Temporary Guardian - Limited access'}
                  </Typography>
                </Grid>
                {formData.parentRole === 'helper' && formData.helperExpiryDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Access Expires:</Typography>
                    <Typography>{new Date(formData.helperExpiryDate).toLocaleDateString()}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              By submitting this registration, you confirm that all information provided is accurate. 
              Your account will be reviewed and approved by the school administration.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (activeStep === steps.length) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Registration Submitted!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {success}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will receive an email once your account is approved by the school administrator.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Parent Registration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Register for a parent account to access your child's school information
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ParentRegistration;
