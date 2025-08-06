import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  CircularProgress
} from '@mui/material';
import { 
  DatePicker, 
  TimePicker, 
  DateTimePicker 
} from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from 'notistack';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isBefore from 'date-fns/isBefore';
import addHours from 'date-fns/addHours';
import { 
  Person as PersonIcon, 
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { createEvent } from '../services/eventService';

// Validation function for the form
const validateForm = (data) => {
  const errors = {};
  
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }
  
  if (!data.endDate) {
    errors.endDate = 'End date is required';
  } else if (data.startDate && isBefore(new Date(data.endDate), new Date(data.startDate))) {
    errors.endDate = 'End date must be after start date';
  }
  
  if (!data.eventType) {
    errors.eventType = 'Event type is required';
  }
  
  return errors;
};

const CreateEventPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  
  // Get initial date from URL params if available (for creating from calendar)
  const initialDate = location.state?.date ? new Date(location.state.date) : null;
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    eventType: 'meeting',
    startDate: initialDate || new Date(),
    endDate: initialDate ? addHours(new Date(initialDate), 1) : addHours(new Date(), 1),
    location: '',
    isAllDay: false,
    isRecurring: false,
    recurrencePattern: 'none',
    attendees: [],
    createdBy: currentUser?.uid || '',
    color: '#3f51b5' // Default color
  });
  
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available event types with icons and colors
  const eventTypes = [
    { value: 'meeting', label: 'Meeting', color: '#3f51b5' },
    { value: 'class', label: 'Class', color: '#4caf50' },
    { value: 'exam', label: 'Exam', color: '#f44336' },
    { value: 'assignment', label: 'Assignment', color: '#ff9800' },
    { value: 'holiday', label: 'Holiday', color: '#9c27b0' },
    { value: 'other', label: 'Other', color: '#607d8b' },
  ];

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Handle special cases
    if (name === 'isAllDay' && checked) {
      // When all day is checked, adjust the start and end dates to be full days
      const start = eventData.startDate || new Date();
      const end = eventData.endDate || addHours(new Date(), 1);
      
      setEventData(prev => ({
        ...prev,
        [name]: checked,
        startDate: new Date(start.setHours(0, 0, 0, 0)),
        endDate: new Date(end.setHours(23, 59, 59, 999))
      }));
    } else if (name === 'eventType') {
      // Update color when event type changes
      const selectedType = eventTypes.find(type => type.value === value);
      setEventData(prev => ({
        ...prev,
        [name]: value,
        color: selectedType?.color || '#3f51b5'
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleDateChange = (date, field) => {
    if (!date) return;
    
    const newEventData = {
      ...eventData,
      [field]: date
    };
    
    // If end date is before start date, adjust it
    if (field === 'startDate' && new Date(date) > new Date(newEventData.endDate)) {
      newEventData.endDate = addHours(new Date(date), 1);
    }
    
    setEventData(newEventData);
    
    // Clear date-related errors
    if (errors[field] || errors.endDate) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
        endDate: field === 'startDate' ? undefined : prev.endDate
      }));
    }
  };
  
  const handleAddAttendee = () => {
    if (!attendeeEmail.trim()) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attendeeEmail)) {
      enqueueSnackbar('Please enter a valid email address', { variant: 'warning' });
      return;
    }
    
    if (eventData.attendees.includes(attendeeEmail)) {
      enqueueSnackbar('This email is already added', { variant: 'info' });
      return;
    }
    
    setEventData(prev => ({
      ...prev,
      attendees: [...prev.attendees, attendeeEmail.trim()]
    }));
    
    setAttendeeEmail('');
  };
  
  const handleRemoveAttendee = (emailToRemove) => {
    setEventData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(email => email !== emailToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(eventData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      enqueueSnackbar('Please fix the errors in the form', { variant: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare event data for submission
      const eventToCreate = {
        ...eventData,
        startDate: eventData.startDate.toISOString(),
        endDate: eventData.endDate.toISOString(),
        // Add current user as attendee if not already added
        attendees: Array.from(new Set([...eventData.attendees, currentUser?.email].filter(Boolean)))
      };
      
      // Create event using the event service
      const createdEvent = await createEvent(eventToCreate);
      
      enqueueSnackbar('Event created successfully!', { variant: 'success' });
      
      // Navigate to calendar or event details
      navigate('/calendar', { 
        state: { 
          eventCreated: true,
          eventId: createdEvent.id 
        } 
      });
      
    } catch (error) {
      console.error('Error creating event:', error);
      enqueueSnackbar(
        error.message || 'Failed to create event. Please try again.', 
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Event
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="title"
                name="title"
                label="Event Title"
                value={eventData.title}
                onChange={handleChange}
                margin="normal"
                error={!!errors.title}
                helperText={errors.title}
              />
              
              <FormControl fullWidth margin="normal" error={!!errors.eventType}>
                <InputLabel id="event-type-label">Event Type *</InputLabel>
                <Select
                  labelId="event-type-label"
                  id="eventType"
                  name="eventType"
                  value={eventData.eventType}
                  label="Event Type *"
                  onChange={handleChange}
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            backgroundColor: type.color,
                            border: '1px solid rgba(0,0,0,0.1)'
                          }} 
                        />
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.eventType && (
                  <Typography variant="caption" color="error">
                    {errors.eventType}
                  </Typography>
                )}
              </FormControl>
              
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={eventData.description}
                onChange={handleChange}
                margin="normal"
                placeholder="Enter event details..."
              />
              
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location"
                value={eventData.location}
                onChange={handleChange}
                margin="normal"
                placeholder="e.g., Room 101, Online, etc."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Start Date & Time
                  </Typography>
                  <DateTimePicker
                    value={eventData.startDate}
                    onChange={(date) => handleDateChange(date, 'startDate')}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                      />
                    )}
                    ampm={true}
                    disablePast
                    disabled={isSubmitting}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    End Date & Time
                  </Typography>
                  <DateTimePicker
                    value={eventData.endDate}
                    onChange={(date) => handleDateChange(date, 'endDate')}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                      />
                    )}
                    ampm={true}
                    minDateTime={eventData.startDate}
                    disabled={isSubmitting}
                  />
                </Box>
              </LocalizationProvider>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eventData.isAllDay}
                    onChange={handleChange}
                    name="isAllDay"
                    color="primary"
                    disabled={isSubmitting}
                  />
                }
                label="All Day Event"
                sx={{ mt: 1, display: 'block' }}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eventData.isRecurring}
                    onChange={handleChange}
                    name="isRecurring"
                    color="primary"
                    disabled={isSubmitting}
                  />
                }
                label="Recurring Event"
                sx={{ display: 'block' }}
              />
              
              {eventData.isRecurring && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="recurrence-pattern-label">Recurrence Pattern</InputLabel>
                  <Select
                    labelId="recurrence-pattern-label"
                    id="recurrencePattern"
                    name="recurrencePattern"
                    value={eventData.recurrencePattern}
                    label="Recurrence Pattern"
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="biweekly">Bi-weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add Attendees
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Enter email address"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    disabled={isSubmitting}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttendee())}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddAttendee}
                    disabled={!attendeeEmail.trim() || isSubmitting}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                
                {eventData.attendees.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      {eventData.attendees.length} attendee(s)
                    </Typography>
                    <Box sx={{ 
                      maxHeight: 150, 
                      overflowY: 'auto',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      borderRadius: 1,
                      p: 1
                    }}>
                      <List dense>
                        {eventData.attendees.map((email, index) => (
                          <ListItem 
                            key={index} 
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                aria-label="remove"
                                onClick={() => handleRemoveAttendee(email)}
                                disabled={isSubmitting}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            }
                            sx={{ px: 1 }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={email} 
                              primaryTypographyProps={{
                                variant: 'body2',
                                noWrap: true,
                                title: email
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              {isSubmitting && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="textSecondary">
                    Creating event...
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={() => navigate(-1)}
                variant="outlined"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;
