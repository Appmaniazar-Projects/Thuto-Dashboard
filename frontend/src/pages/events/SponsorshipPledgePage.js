import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { ArrowBack, ArrowForward, Check } from '@mui/icons-material';
import { createSponsorship, getEventSponsorships } from '../../services/eventService';

const steps = ['Pledge Type', 'Pledge Details', 'Contact Information', 'Review & Confirm'];

export default function SponsorshipPledgePage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pledgeHistory, setPledgeHistory] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    // Sponsorship Details (using sponsorship structure)
    sponsorName: '',                    // Parent name
    sponsorEmail: '',                   // Parent email
    sponsorPhone: '',                   // Parent phone
    sponsorshipLevel: 'parent',         // Parent pledge level
    sponsorshipAmount: '',              // Amount for monetary
    description: '',                    // Pledge description
    benefits: [],                       // Type-specific benefits
    
    // Goods/Services details
    itemsDescription: '',               // For goods pledges
    serviceDescription: '',             // For service pledges
    estimatedValue: '',                 // Estimated value for goods/services
    
    // Privacy Options
    anonymousPledge: false,
    displayPublicly: true,
    
    // Additional Information
    notes: '',
    specialRequirements: '',
    
    // Event context
    eventId: eventId
  });

  // Load user profile and pledge history
  useEffect(() => {
    loadUserProfile();
    loadPledgeHistory();
  }, [eventId]);

  const loadUserProfile = () => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userInfo = JSON.parse(storedUser);
        setFormData(prev => ({
          ...prev,
          sponsorName: userInfo.fullName || userInfo.name || '',
          sponsorEmail: userInfo.email || '',
          sponsorPhone: userInfo.phoneNumber || userInfo.phone || ''
        }));
      } catch (e) {
        console.error('Error loading user profile:', e);
      }
    }
  };

  const loadPledgeHistory = async () => {
    try {
      // Get all sponsorships for this event and filter by current user
      const sponsorships = await getEventSponsorships(eventId);
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      
      // Filter to show only parent pledges by current user
      const parentPledges = sponsorships.filter(s => 
        s.sponsorshipLevel === 'parent' && s.createdBy === userId
      );
      
      setPledgeHistory(parentPledges);
    } catch (error) {
      console.error('Error loading pledge history:', error);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    // Handle pledge type mapping to sponsorship benefits
    if (field === 'pledgeType') {
      let benefits = [];
      let description = '';
      
      switch (value) {
        case 'monetary':
          benefits = ['monetary_donation'];
          description = 'Monetary donation';
          break;
        case 'goods':
          benefits = ['goods_donation'];
          description = 'Goods/items donation';
          break;
        case 'services':
          benefits = ['service_donation'];
          description = 'Services/volunteer time';
          break;
      }
      
      setFormData(prev => ({
        ...prev,
        pledgeType: value,
        benefits: benefits,
        description: description
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0: // Pledge Type
        if (!formData.pledgeType) {
          setError('Please select a pledge type');
          return false;
        }
        return true;
      
      case 1: // Pledge Details
        if (formData.pledgeType === 'monetary' && !formData.sponsorshipAmount) {
          setError('Please enter a pledge amount');
          return false;
        }
        if (formData.pledgeType === 'goods' && !formData.itemsDescription) {
          setError('Please describe the items you are pledging');
          return false;
        }
        if (formData.pledgeType === 'services' && !formData.serviceDescription) {
          setError('Please describe the services you are offering');
          return false;
        }
        if (!formData.description) {
          setError('Please provide a description for your pledge');
          return false;
        }
        return true;
      
      case 2: // Contact Information
        if (!formData.sponsorName || !formData.sponsorEmail || !formData.sponsorPhone) {
          setError('Please ensure all contact information is complete');
          return false;
        }
        return true;
      
      case 3: // Review & Confirm
        return true;
      
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Map pledge data to sponsorship format
      const sponsorshipData = {
        sponsorName: formData.anonymousPledge ? 'Anonymous Parent' : formData.sponsorName,
        sponsorEmail: formData.sponsorEmail,
        sponsorPhone: formData.sponsorPhone,
        sponsorshipLevel: 'parent',
        sponsorshipAmount: formData.pledgeType === 'monetary' ? Number(formData.sponsorshipAmount) : 0,
        description: formData.description,
        benefits: formData.benefits,
        notes: formData.notes,
        specialRequirements: formData.specialRequirements,
        
        // Add type-specific details
        ...(formData.pledgeType === 'goods' && {
          itemsDescription: formData.itemsDescription,
          estimatedValue: Number(formData.estimatedValue) || 0
        }),
        ...(formData.pledgeType === 'services' && {
          serviceDescription: formData.serviceDescription,
          estimatedValue: Number(formData.estimatedValue) || 0
        }),
        
        // Privacy settings
        anonymousPledge: formData.anonymousPledge,
        displayPublicly: formData.displayPublicly
      };

      await createSponsorship(eventId, sponsorshipData);
      setSuccess('Pledge submitted successfully! You will receive a confirmation email shortly.');
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Failed to submit pledge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What would you like to pledge?
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={formData.pledgeType}
                onChange={handleInputChange('pledgeType')}
              >
                <FormControlLabel 
                  value="monetary" 
                  control={<Radio />} 
                  label="Monetary donation" 
                />
                <FormControlLabel 
                  value="goods" 
                  control={<Radio />} 
                  label="Goods/items" 
                />
                <FormControlLabel 
                  value="services" 
                  control={<Radio />} 
                  label="Services/volunteer time" 
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pledge Details
            </Typography>
            
            {formData.pledgeType === 'monetary' && (
              <TextField
                fullWidth
                label="Pledge Amount (R)"
                type="number"
                value={formData.sponsorshipAmount}
                onChange={handleInputChange('sponsorshipAmount')}
                margin="normal"
                required
              />
            )}

            {formData.pledgeType === 'goods' && (
              <>
                <TextField
                  fullWidth
                  label="Description of Items"
                  multiline
                  rows={3}
                  value={formData.itemsDescription}
                  onChange={handleInputChange('itemsDescription')}
                  margin="normal"
                  placeholder="e.g., 50 notebooks, 20 pens, 10 calculators"
                  required
                />
                <TextField
                  fullWidth
                  label="Estimated Value (R)"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={handleInputChange('estimatedValue')}
                  margin="normal"
                />
              </>
            )}

            {formData.pledgeType === 'services' && (
              <>
                <TextField
                  fullWidth
                  label="Service Description"
                  multiline
                  rows={3}
                  value={formData.serviceDescription}
                  onChange={handleInputChange('serviceDescription')}
                  margin="normal"
                  placeholder="e.g., Photography services for 4 hours, event setup assistance"
                  required
                />
                <TextField
                  fullWidth
                  label="Estimated Value (R)"
                  type="number"
                  value={formData.estimatedValue}
                  onChange={handleInputChange('estimatedValue')}
                  margin="normal"
                />
              </>
            )}

            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleInputChange('description')}
              margin="normal"
              placeholder="Any additional information about your pledge"
              required
            />

            <TextField
              fullWidth
              label="Special Instructions"
              multiline
              rows={2}
              value={formData.specialRequirements}
              onChange={handleInputChange('specialRequirements')}
              margin="normal"
              placeholder="Delivery instructions, timing preferences, etc."
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Contact information has been pre-filled from your profile
            </Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              value={formData.sponsorName}
              onChange={handleInputChange('sponsorName')}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.sponsorEmail}
              onChange={handleInputChange('sponsorEmail')}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.sponsorPhone}
              onChange={handleInputChange('sponsorPhone')}
              margin="normal"
              required
            />

            <Box mt={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.anonymousPledge}
                    onChange={handleInputChange('anonymousPledge')}
                  />
                }
                label="Make this pledge anonymous"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.displayPublicly}
                    onChange={handleInputChange('displayPublicly')}
                    disabled={formData.anonymousPledge}
                  />
                }
                label="Display my name publicly in sponsor list"
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Confirm
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Pledge Summary:
                </Typography>
                
                <Typography variant="body2">
                  <strong>Type:</strong> {formData.pledgeType.charAt(0).toUpperCase() + formData.pledgeType.slice(1)}
                </Typography>
                
                {formData.pledgeType === 'monetary' && (
                  <Typography variant="body2">
                    <strong>Amount:</strong> R{formData.sponsorshipAmount}
                  </Typography>
                )}
                
                {formData.pledgeType === 'goods' && (
                  <>
                    <Typography variant="body2">
                      <strong>Items:</strong> {formData.itemsDescription}
                    </Typography>
                    {formData.estimatedValue && (
                      <Typography variant="body2">
                        <strong>Estimated Value:</strong> R{formData.estimatedValue}
                      </Typography>
                    )}
                  </>
                )}
                
                {formData.pledgeType === 'services' && (
                  <>
                    <Typography variant="body2">
                      <strong>Services:</strong> {formData.serviceDescription}
                    </Typography>
                    {formData.estimatedValue && (
                      <Typography variant="body2">
                        <strong>Estimated Value:</strong> R{formData.estimatedValue}
                      </Typography>
                    )}
                  </>
                )}
                
                {formData.description && (
                  <Typography variant="body2">
                    <strong>Additional Notes:</strong> {formData.description}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Contact Information:
                </Typography>
                
                <Typography variant="body2">
                  <strong>Name:</strong> {formData.anonymousPledge ? 'Anonymous' : formData.sponsorName}
                </Typography>
                
                <Typography variant="body2">
                  <strong>Email:</strong> {formData.sponsorEmail}
                </Typography>
                
                <Typography variant="body2">
                  <strong>Phone:</strong> {formData.sponsorPhone}
                </Typography>
                
                <Typography variant="body2">
                  <strong>Display Publicly:</strong> {formData.anonymousPledge ? 'No (Anonymous)' : formData.displayPublicly ? 'Yes' : 'No'}
                </Typography>
                
                {formData.specialRequirements && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2">
                      <strong>Special Instructions:</strong> {formData.specialRequirements}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Sponsorship Pledge
        </Typography>
        
        <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
          Support our event with your generous pledge
        </Typography>

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

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Check />}
            >
              {loading ? 'Submitting...' : 'Submit Pledge'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Box>

        {/* Pledge History */}
        {pledgeHistory.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Previous Pledges
            </Typography>
            {pledgeHistory.map((pledge) => (
              <Card key={pledge.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2">
                    {pledge.pledgeType} - {pledge.pledgeDate}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {pledge.pledgeDescription}
                  </Typography>
                  <Typography variant="body2">
                    Status: {pledge.status}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
