import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import format from 'date-fns/format';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isSameDay from 'date-fns/isSameDay';
import parseISO from 'date-fns/parseISO';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import { getEvents, createEvent, updateEvent, deleteEvent, getEventTypes } from '../../services/calendarService';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Event as EventIcon,
  Add,
  Edit,
  Delete,
  ChevronLeft,
  ChevronRight,
  Description,
  Person,
  School,
  Group,
  AccountTree
} from '@mui/icons-material';

// Event types for the select dropdown
const eventTypes = [
  { value: 'assessment', label: 'Assessment', icon: <Description /> },
  { value: 'meeting', label: 'Meeting', icon: <Person /> },
  { value: 'event', label: 'Event', icon: <EventIcon /> },
  { value: 'deadline', label: 'Deadline', icon: <Group /> },
  { value: 'training', label: 'Training', icon: <School /> }
];

// Sample data structure for calendar events
const sampleEvents = {
  admin: [
    {
      id: 1,
      title: 'Board Meeting',
      date: '2025-07-15',
      time: '09:00',
      type: 'meeting',
      description: 'Monthly board meeting to discuss school operations',
    },
    {
      id: 2,
      title: 'Parent-Teacher Meeting',
      date: '2025-07-20',
      time: '14:00',
      type: 'meeting',
      description: 'Monthly parent-teacher meeting',
    },
    {
      id: 3,
      title: 'Staff Training',
      date: '2025-07-25',
      time: '10:00',
      type: 'training',
      description: 'Professional development session',
    }
  ],
  teacher: [
    {
      id: 1,
      title: 'Math Test',
      date: '2025-07-16',
      time: '09:00',
      type: 'assessment',
      description: 'Grade 10 Math Test',
    },
    {
      id: 2,
      title: 'Parent Meeting',
      date: '2025-07-18',
      time: '15:00',
      type: 'meeting',
      description: 'Parent consultation',
    }
  ]
};

// Styled components
const CalendarDay = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  minHeight: 0,
  '&:hover': {
    transform: 'scale(1.02)',
    zIndex: 1,
    boxShadow: theme.shadows[3],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s',
  },
  '&:hover::before': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const EventCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '&:last-child': {
    marginBottom: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: 'pointer',
  transition: 'background-color 0.2s',
}));

const Calendar = () => {
  const { user } = useAuth();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDayPopup, setShowDayPopup] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTypes, setEventTypes] = useState([
    { value: 'meeting', label: 'Meeting', icon: <Person /> },
    { value: 'assessment', label: 'Assessment', icon: <Description /> },
    { value: 'event', label: 'Event', icon: <EventIcon /> },
    { value: 'deadline', label: 'Deadline', icon: <Group /> },
    { value: 'training', label: 'Training', icon: <School /> },
  ]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting',
    time: format(new Date(), 'HH:mm'),
    description: ''
  });

  // Fetch events for the current month
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the date range for the current month view
      const start = startOfDay(startOfMonth(currentMonth));
      const end = endOfDay(endOfMonth(currentMonth));
      
      // Fetch events from the API
      const events = await getEvents(start.toISOString(), end.toISOString());
      setEvents(events);
      
      // Fetch event types if needed
      const types = await getEventTypes();
      if (types && types.length > 0) {
        setEventTypes(types);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  // Load events when component mounts or month changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Generate days for the current month view
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add empty days at the start if needed
    const startDay = start.getDay();
    const emptyStartDays = Array(startDay).fill(null);
    
    return [...emptyStartDays, ...days];
  };

  // Check if user can edit (admin or teacher)
  const canEdit = ['admin', 'teacher'].includes(user?.role);

  // Handle date selection
  const handleDateClick = (day) => {
    setSelectedDate(day);
    setShowDayPopup(true);
  };

  // Handle adding a new event
  const handleAddEvent = () => {
    if (canEdit) {
      setNewEvent({
        title: '',
        type: 'meeting',
        time: format(new Date(), 'HH:mm'),
        description: ''
      });
      setOpenAddDialog(true);
    }
  };

  // Handle editing an existing event
  const handleEditEvent = (event) => {
    if (canEdit) {
      setSelectedEvent(event);
      setNewEvent({
        title: event.title,
        type: event.type,
        time: event.time,
        description: event.description || ''
      });
      setOpenEditDialog(true);
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (event) => {
    if (!canEdit) return;
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(event.id);
        setEvents(events.filter(e => e.id !== event.id));
      } catch (error) {
        console.error('Error deleting event:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  // Handle form submission for adding/editing events
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedEvent) {
        // Update existing event
        const updatedEvent = await updateEvent(selectedEvent.id, {
          ...newEvent,
          date: selectedEvent.date, // Keep the original date
          userId: user.id // Ensure the event is associated with the current user
        });
        
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? updatedEvent : event
        ));
        setOpenEditDialog(false);
      } else if (selectedDate) {
        // Add new event
        const newEventObj = await createEvent({
          ...newEvent,
          date: format(selectedDate, 'yyyy-MM-dd'),
          userId: user.id
        });
        
        setEvents([...events, newEventObj]);
        setOpenAddDialog(false);
      }
      
      // Reset form
      setNewEvent({
        title: '',
        type: 'meeting',
        time: format(new Date(), 'HH:mm'),
        description: ''
      });
      setSelectedEvent(null);
      
    } catch (error) {
      console.error('Error saving event:', error);
      // You might want to show an error message to the user here
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(
      event => format(parseISO(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Navigate to previous/next month
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const daysInMonth = getDaysInMonth();
  const monthName = format(currentMonth, 'MMMM yyyy');

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflowX: 'auto' }}>
      {/* Calendar Header - User's Name */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {user?.name || 'My'} Calendar
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeft />
          </IconButton>
          <Typography variant="subtitle1">
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Days of Week */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        mb: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '0.875rem'
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Typography key={day} variant="body2" color="text.secondary">
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        '& > *': {
          aspectRatio: '1',
          minHeight: '100px',
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }
      }}>
        {daysInMonth.map((day, index) => {
          const dateEvents = day ? getEventsForDate(day) : [];
          const hasEvents = dateEvents.length > 0;
          const isSelected = day && selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = day && format(day, 'MM') === format(currentMonth, 'MM');
          
          return day ? (
            <CalendarDay 
              key={index}
              elevation={1}
              onClick={() => handleDateClick(day)}
              isSelected={isSelected}
              isCurrentMonth={isCurrentMonth}
              hasEvents={hasEvents}
              sx={{
                opacity: isCurrentMonth ? 1 : 0.5,
                backgroundColor: isSelected ? 'primary.light' : 'background.paper',
                color: isSelected ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  transform: 'scale(1.02)',
                  zIndex: 1,
                  boxShadow: 3
                }
              }}
            >
              <Box sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" align="right" sx={{ fontWeight: 'bold' }}>
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ flex: 1, overflow: 'hidden', mt: 0.5 }}>
                  {hasEvents && (
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography 
                        variant="caption" 
                        noWrap 
                        sx={{
                          display: 'block',
                          textOverflow: 'ellipsis',
                          color: isSelected ? 'primary.contrastText' : 'text.primary',
                          fontSize: '0.7rem',
                          lineHeight: 1.2
                        }}
                      >
                        {dateEvents[0].title}
                      </Typography>
                      {dateEvents.length > 1 && (
                        <Typography 
                          variant="caption" 
                          sx={{
                            color: isSelected ? 'primary.contrastText' : 'text.secondary',
                            fontSize: '0.65rem',
                            opacity: 0.9
                          }}
                        >
                          +{dateEvents.length - 1} more
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </CalendarDay>
          ) : (
            <Box key={index} />
          );
        })}
      </Box>

      {/* Day Popup Dialog */}
      <Dialog
        open={showDayPopup}
        onClose={() => setShowDayPopup(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event) => (
                <EventCard key={event.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {event.icon}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.time} • {eventTypes.find(t => t.value === event.type)?.label}
                        </Typography>
                        {event.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                      {canEdit && (
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </EventCard>
              ))
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                No events for this day
              </Typography>
            )}
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddEvent}
                fullWidth
                sx={{ mt: 2 }}
              >
                Add Event
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDayPopup(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Event Dialog */}
      <Dialog
        open={openAddDialog || openEditDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setOpenEditDialog(false);
          setSelectedEvent(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Event Title"
                fullWidth
                variant="outlined"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={newEvent.type}
                  label="Event Type"
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  required
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                label="Time"
                type="time"
                fullWidth
                variant="outlined"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenAddDialog(false);
                setOpenEditDialog(false);
                setSelectedEvent(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedEvent ? 'Update Event' : 'Add Event'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Calendar;
