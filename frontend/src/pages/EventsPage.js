import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Avatar,
  Tooltip,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isBefore,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import enGB from 'date-fns/locale/en-GB';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PageTitle from '../components/common/PageTitle';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adminService from '../services/adminService';
import {
  cancelEventSignup,
  cancelEvent as cancelEventById,
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  setTeacherAttendanceStatus,
  signUpForEventRole,
  updateEvent,
  submitRSVP,
  createSponsorship,
  signUpForVolunteerRole,
  exportEvent,
} from '../services/eventService';
import { useSnackbar } from 'notistack';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const toSafeDate = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return isValid(d) ? d : null;
};

const toDateTimeLocalInputValue = (date) => {
  const d = toSafeDate(date);
  if (!d) return '';
  const pad = (n) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toBackendDateTime = (value) => {
  if (!value) return '';
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return s;
};

const toBackendDateOnly = (value) => {
  if (!value) return '';
  const d = toSafeDate(value);
  if (!d) return '';
  return format(d, 'yyyy-MM-dd');
};

const toBackendTimeOnly = (value) => {
  if (!value) return null;
  const d = toSafeDate(value);
  if (!d) return null;
  return format(d, 'HH:mm:ss');
};

const buildRoleDraft = (role = {}) => {
  const getClientId = () => {
    if (role.clientId) return role.clientId;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random()}`;
  };

  return {
    clientId: getClientId(),
    id: role.id ?? undefined,
    roleName: role.roleName || '',
    slotLimit: role.slotLimit ?? 1,
  };
};

const deriveStatus = (event) => {
  const now = new Date();
  const start = toSafeDate(event?.startDate);
  const end = toSafeDate(event?.endDate);
  const manual = (event?.status ?? '').toString().trim();

  if (manual) return manual;
  if (!start || !end) return 'Upcoming';
  if (isAfter(now, end)) return 'Past';
  if (isBefore(now, start)) return 'Upcoming';
  return 'Upcoming';
};

const getStatusColor = (status) => {
  const s = (status ?? '').toString().toLowerCase();
  if (s === 'cancelled') return 'error';
  if (s === 'past') return 'default';
  return 'success';
};

const canInteractWithEvent = (event) => {
  const status = deriveStatus(event);
  return status.toLowerCase() === 'upcoming';
};

const getHasParentSignup = (event) => {
  if (!event || typeof event !== 'object') return false;
  return Boolean(
    event.mySignup ||
      event.isSignedUp ||
      event.signedUp ||
      event.signedUpRoleId ||
      event.parentSignup
  );
};

const EventsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = (currentUser?.role ?? '').toString().toLowerCase();
  const isAdmin = role === 'admin' || role === 'administrator';
  const isParent = role === 'parent';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  const canCreateEvents = isAdmin || isTeacher;

  const [viewMode, setViewMode] = useState((isAdmin || isTeacher) ? 'month' : (isMobile ? 'agenda' : 'month'));
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [apiFailed, setApiFailed] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // New state for enhanced features
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [sponsorshipDialogOpen, setSponsorshipDialogOpen] = useState(false);
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const [rsvpData, setRsvpData] = useState({
    response: 'attending',
    numberOfGuests: 0,
    dietaryRequirements: '',
    specialRequests: ''
  });

  const [sponsorshipData, setSponsorshipData] = useState({
    pledgeType: 'monetary',
    pledgeAmount: '',
    pledgeDescription: '',
    isAnonymous: false
  });

  const [volunteerData, setVolunteerData] = useState({
    roleId: '',
    notes: '',
    skills: '',
    timePreferences: [],
    emergencyContact: '',
    specialRequirements: ''
  });

  // State for available organizers
  const [availableOrganizers, setAvailableOrganizers] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState('create');
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    status: '',
    organizer: '',
    eventType: '',
    sponsorshipEnabled: false,
    maxAttendees: null,
    roles: [],
  });

  const derivedFormStatus = useMemo(() => {
    const manual = (formData.status ?? '').toString().trim().toLowerCase();
    if (manual === 'cancelled') return 'Cancelled';

    const start = formData.startDate ? new Date(formData.startDate) : null;
    const end = formData.endDate ? new Date(formData.endDate) : null;
    if (!start || !end || !isValid(start) || !isValid(end)) return 'Upcoming';

    const now = new Date();
    if (isAfter(now, end)) return 'Past';
    return 'Upcoming';
  }, [formData.endDate, formData.startDate, formData.status]);

  const range = useMemo(() => {
    if (viewMode === 'agenda') {
      const start = new Date();
      const end = addDays(start, 30);
      return {
        start,
        end,
      };
    }

    const start = startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(anchorDate), { weekStartsOn: 1 });
    return { start, end };
  }, [anchorDate, viewMode]);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setWarning('');
      setApiFailed(false);
      const startDate = format(range.start, 'yyyy-MM-dd');
      const endDate = format(range.end, 'yyyy-MM-dd');
      const data = await getEvents(startDate, endDate);
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setEvents([]);
      setWarning('Events are temporarily unavailable. Showing an empty calendar.');
      setApiFailed(true);
      setViewMode('month');
    } finally {
      setLoading(false);
    }
  }, [range.end, range.start]);

  useEffect(() => {
    loadEvents();
    loadAvailableOrganizers();
  }, [loadEvents]);

  useEffect(() => {
    if (!apiFailed) {
      loadEvents();
    }
  }, [apiFailed, loadEvents]);

  useEffect(() => {
    const shouldOpen = searchParams.get('create') === '1';
    if (!shouldOpen) return;
    if (!canCreateEvents) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('create');
        return next;
      }, { replace: true });
      return;
    }

    openCreate(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('create');
      return next;
    }, { replace: true });
    navigate('/events', { replace: true });
  }, [canCreateEvents, navigate, openCreate, searchParams, setSearchParams]);

  const rbcEvents = useMemo(() => {
    return (events || [])
      .map((ev) => {
        const start = toSafeDate(ev.startDate);
        const end = toSafeDate(ev.endDate);
        if (!start || !end) return null;
        return {
          ...ev,
          start,
          end,
          title: ev.title || 'Untitled event',
        };
      })
      .filter(Boolean);
  }, [events]);

  const agendaItems = useMemo(() => {
    const list = [...(events || [])]
      .map((ev) => ({
        ...ev,
        _start: toSafeDate(ev.startDate),
        _end: toSafeDate(ev.endDate),
      }))
      .filter((ev) => ev._start && ev._end)
      .sort((a, b) => a._start - b._start);

    return list;
  }, [events]);

  const openDetails = (ev) => {
    setSelectedEvent(ev);
    setDetailsOpen(true);

    const eventId = ev?.id;
    if (!eventId) return;

    (async () => {
      try {
        const details = await getEventById(eventId);
        if (!details) return;
        setSelectedEvent((prev) => {
          if (!prev || String(prev.id) !== String(eventId)) return prev;
          return { ...prev, ...details };
        });
      } catch (e) {
        // Ignore detail load failures so the dialog still works with list data
      }
    })();
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedEvent(null);
  };

  function openCreate(slotInfo) {
    setEditMode('create');
    setFormData({
      id: null,
      title: '',
      description: '',
      startDate: slotInfo?.start ? toDateTimeLocalInputValue(slotInfo.start) : '',
      endDate: slotInfo?.end ? toDateTimeLocalInputValue(slotInfo.end) : '',
      location: '',
      status: '',
      organizer: '',
      eventType: '',
      sponsorshipEnabled: false,
      maxAttendees: null,
      roles: [],
    });
    setEditOpen(true);
  }

  const openEdit = (ev) => {
    setEditMode('edit');
    setFormData({
      id: ev.id,
      title: ev.title || '',
      description: ev.description || '',
      startDate: toDateTimeLocalInputValue(ev.startDate),
      endDate: toDateTimeLocalInputValue(ev.endDate),
      location: ev.location || '',
      status: ev.status || '',
      organizer: ev.organizer || '',
      eventType: ev.eventType || '',
      sponsorshipEnabled: ev.sponsorshipEnabled || false,
      maxAttendees: ev.maxAttendees || null,
      roles: Array.isArray(ev.roles) ? ev.roles.map((r) => buildRoleDraft({ id: r.id, roleName: r.roleName || '', slotLimit: r.slotLimit ?? 0 })) : [],
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
  };

  const upsertRoleRow = (idx, updates) => {
    setFormData((prev) => {
      const nextRoles = [...(prev.roles || [])];
      nextRoles[idx] = { ...nextRoles[idx], ...updates };
      return { ...prev, roles: nextRoles };
    });
  };

  const addRoleRow = () => {
    setFormData((prev) => ({
      ...prev,
      roles: [...(prev.roles || []), buildRoleDraft()],
    }));
  };

  const removeRoleRow = (idx) => {
    setFormData((prev) => {
      const nextRoles = [...(prev.roles || [])];
      nextRoles.splice(idx, 1);
      return { ...prev, roles: nextRoles };
    });
  };

  const submitEvent = async () => {
    try {
      if (!canCreateEvents) return;

      if (editMode === 'edit' && derivedFormStatus.toLowerCase() === 'cancelled') {
        if (!formData.id) return;
        await cancelEventById(formData.id);
        enqueueSnackbar('Event cancelled', { variant: 'success' });
        closeEdit();
        await loadEvents();
        return;
      }

      const start = formData.startDate ? new Date(formData.startDate) : null;
      const end = formData.endDate ? new Date(formData.endDate) : null;
      if (!formData.title?.trim()) {
        enqueueSnackbar('Title is required', { variant: 'warning' });
        return;
      }
      if (!start || !end || !isValid(start) || !isValid(end)) {
        enqueueSnackbar('Start and end dates are required', { variant: 'warning' });
        return;
      }
      if (isAfter(start, end)) {
        enqueueSnackbar('End date must be after start date', { variant: 'warning' });
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description || '',
        startDate: toBackendDateOnly(formData.startDate),
        startTime: toBackendTimeOnly(formData.startDate),
        endDate: toBackendDateOnly(formData.endDate),
        endTime: toBackendTimeOnly(formData.endDate),
        location: formData.location || '',
        status: derivedFormStatus,
        organizer: formData.organizer || '',
        eventType: formData.eventType || '',
        sponsorshipEnabled: formData.sponsorshipEnabled || false,
        maxAttendees: formData.maxAttendees || null,
        roles: (formData.roles || [])
          .map((r) => ({
            id: r.id,
            roleName: (r.roleName || '').trim(),
            slotLimit: Number(r.slotLimit) || 0,
          }))
          .filter((r) => r.roleName),
      };

      if (editMode === 'create') {
        const response = await createEvent(payload);
        console.log('Event created response:', response);
        enqueueSnackbar('Event created', { variant: 'success' });
      } else {
        console.log('Updating event with payload:', payload);
        const response = await updateEvent(formData.id, payload);
        console.log('Event updated response:', response);
        enqueueSnackbar('Event updated', { variant: 'success' });
      }

      await loadEvents();
      closeEdit();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to save event', { variant: 'error' });
    }
  };

  const confirmDelete = async (ev) => {
    if (!isAdmin && !isTeacher) return;
    const ok = window.confirm('Delete this event?');
    if (!ok) return;
    try {
      await deleteEvent(ev.id);
      enqueueSnackbar('Event deleted', { variant: 'success' });
      closeDetails();
      await loadEvents();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to delete event', { variant: 'error' });
    }
  };

  const parentSignup = async (ev, roleId) => {
    try {
      await signUpForEventRole(ev.id, roleId);
      enqueueSnackbar('Signed up', { variant: 'success' });
      await loadEvents();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to sign up', { variant: 'error' });
    }
  };

  const parentCancel = async (ev) => {
    try {
      await cancelEventSignup(ev.id);
      enqueueSnackbar('Signup cancelled', { variant: 'info' });
      await loadEvents();
      await refreshSelectedEvent(); // Refresh the dialog to show updated availability
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to cancel signup', { variant: 'error' });
    }
  };

  const teacherSetStatus = async (ev, status) => {
    try {
      console.log('Setting teacher attendance:', { eventId: ev.id, status, eventName: ev.title });
      await setTeacherAttendanceStatus(ev.id, status);
      enqueueSnackbar('Attendance updated successfully', { variant: 'success' });
      await loadEvents();
    } catch (e) {
      console.error('Teacher attendance update failed:', e);
      
      // Provide more specific error messages based on status code
      let errorMessage = 'Failed to update attendance';
      
      if (e?.response?.status === 500) {
        errorMessage = 'Server error: The teacher attendance feature may not be available. Please contact support.';
      } else if (e?.response?.status === 404) {
        errorMessage = 'Event not found or attendance endpoint not available';
      } else if (e?.response?.status === 403) {
        errorMessage = 'You do not have permission to update teacher attendance';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const teacherRoleSignup = async (ev, roleId) => {
    try {
      console.log('Teacher signing up for role:', { eventId: ev.id, roleId, eventName: ev.title });
      await signUpForEventRole(ev.id, roleId);
      enqueueSnackbar('Successfully signed up for role!', { variant: 'success' });
      await loadEvents();
      await refreshSelectedEvent(); // Refresh the dialog to show updated availability
    } catch (e) {
      console.error('Teacher role signup failed:', e);
      
      let errorMessage = 'Failed to sign up for role';
      
      if (e?.response?.status === 500) {
        errorMessage = 'Server error: Role signup may not be available. Please contact support.';
      } else if (e?.response?.status === 404) {
        errorMessage = 'Event or role not found';
      } else if (e?.response?.status === 403) {
        errorMessage = 'You do not have permission to sign up for this role';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const getHasTeacherSignup = (ev, roleId) => {
    // Check if teacher is already signed up for a specific role
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const teacherId = currentUser?.id || currentUser?.userId || currentUser?.phoneNumber;
    
    if (!ev.roles || !teacherId) return false;
    
    return ev.roles.some(role => 
      role.id === roleId && 
      Array.isArray(role.signups) && 
      role.signups.some(signup => 
        signup.userId === teacherId || signup.id === teacherId || signup.phoneNumber === teacherId
      )
    );
  };

  const getTeacherSignupRoleId = (ev) => {
    // Get the role ID that teacher is signed up for
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const teacherId = currentUser?.id || currentUser?.userId || currentUser?.phoneNumber;
    
    if (!ev.roles || !teacherId) return null;
    
    for (const role of ev.roles) {
      if (Array.isArray(role.signups) && 
          role.signups.some(signup => 
            signup.userId === teacherId || signup.id === teacherId || signup.phoneNumber === teacherId
          )) {
        return role.id;
      }
    }
    
    return null;
  };

  const teacherCancelSignup = async (ev) => {
    try {
      const roleId = getTeacherSignupRoleId(ev);
      if (!roleId) {
        throw new Error('No role signup found to cancel');
      }
      
      console.log('Teacher cancelling role signup:', { eventId: ev.id, roleId, eventName: ev.title });
      await cancelEventSignup(ev.id);
      enqueueSnackbar('Role signup cancelled successfully', { variant: 'info' });
      await loadEvents();
      await refreshSelectedEvent(); // Refresh the dialog to show updated availability
    } catch (e) {
      console.error('Teacher role signup cancel failed:', e);
      
      let errorMessage = 'Failed to cancel role signup';
      
      if (e?.response?.status === 500) {
        errorMessage = 'Server error: Unable to cancel signup. Please contact support.';
      } else if (e?.response?.status === 404) {
        errorMessage = 'Event or signup not found';
      } else if (e?.response?.status === 403) {
        errorMessage = 'You do not have permission to cancel this signup';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // New handler functions for enhanced features
  const handleRSVP = async () => {
    try {
      await submitRSVP(selectedEvent.id, rsvpData);
      enqueueSnackbar('RSVP submitted successfully', { variant: 'success' });
      setRsvpDialogOpen(false);
      await loadEvents();
      await refreshSelectedEvent();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to submit RSVP', { variant: 'error' });
    }
  };

  const handleSponsorship = async () => {
    try {
      await createSponsorship(selectedEvent.id, sponsorshipData);
      enqueueSnackbar('Sponsorship pledge submitted successfully', { variant: 'success' });
      setSponsorshipDialogOpen(false);
      setSponsorshipData({
        pledgeType: 'monetary',
        pledgeAmount: '',
        pledgeDescription: '',
        isAnonymous: false
      });
      await loadEvents();
      await refreshSelectedEvent();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to submit sponsorship', { variant: 'error' });
    }
  };

  const handleVolunteerSignup = async () => {
    try {
      await signUpForVolunteerRole(selectedEvent.id, volunteerData.roleId, {
        notes: volunteerData.notes,
        skills: volunteerData.skills,
        timePreferences: volunteerData.timePreferences,
        emergencyContact: volunteerData.emergencyContact,
        specialRequirements: volunteerData.specialRequirements
      });
      enqueueSnackbar('Volunteer signup successful', { variant: 'success' });
      setVolunteerDialogOpen(false);
      setVolunteerData({
        roleId: '',
        notes: '',
        skills: '',
        timePreferences: [],
        emergencyContact: '',
        specialRequirements: ''
      });
      await loadEvents();
      await refreshSelectedEvent();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to sign up as volunteer', { variant: 'error' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedEvent.title,
          text: selectedEvent.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar('Event link copied to clipboard', { variant: 'success' });
    }
    setShareDialogOpen(false);
  };

  const handleExport = async () => {
    try {
      const blob = await exportEvent(selectedEvent.id, 'ics');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedEvent.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      enqueueSnackbar('Event exported successfully', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to export event', { variant: 'error' });
    }
  };

  const hasUserRSVPd = () => {
    return selectedEvent?.rsvps?.some(rsvp => rsvp.userId === currentUser?.id);
  };

  const getUserRSVP = () => {
    return selectedEvent?.rsvps?.find(rsvp => rsvp.userId === currentUser?.id);
  };

  const hasUserSignedUp = () => {
    return selectedEvent?.roles?.some(role => 
      role.signups?.some(signup => signup.userId === currentUser?.id)
    );
  };

  const refreshSelectedEvent = async () => {
    if (!selectedEvent?.id) return;
    try {
      const details = await getEventById(selectedEvent.id);
      if (!details) return;
      setSelectedEvent((prev) => {
        if (!prev || String(prev.id) !== String(selectedEvent.id)) return prev;
        return { ...prev, ...details };
      });
    } catch (e) {
      // Ignore detail load failures so the dialog still works with list data
    }
  };

  const canInteractWithEvent = (event) => {
    const status = deriveStatus(event);
    return status === 'UPCOMING' || status === 'ONGOING';
  };

  // Load available organizers (admins and teachers)
  const loadAvailableOrganizers = async () => {
    if (!canCreateEvents) return;
    
    try {
      const [adminResponse, teacherResponse] = await Promise.all([
        adminService.getAllUsers({ role: 'admin' }),
        adminService.getAllUsers({ role: 'teacher' })
      ]);

      const organizers = [
        ...(adminResponse?.data || []).map(user => ({
          id: user.id,
          name: user.name,
          role: 'Admin'
        })),
        ...(teacherResponse?.data || []).map(user => ({
          id: user.id,
          name: user.name,
          role: 'Teacher'
        }))
      ];

      setAvailableOrganizers(organizers);
    } catch (e) {
      console.error('Failed to load organizers:', e);
      // Fallback to current user if available
      if (currentUser && (isAdmin || isTeacher)) {
        setAvailableOrganizers([{
          id: currentUser.id,
          name: currentUser.name || currentUser.email,
          role: isAdmin ? 'Admin' : 'Teacher'
        }]);
      }
    }
  };

  const renderEventRoles = (ev) => {
    console.log('Full event object:', ev);
    
    const rolesRaw =
      (Array.isArray(ev?.eventRoles) && ev.eventRoles) ||
      (Array.isArray(ev?.roleSlots) && ev.roleSlots) ||
      (Array.isArray(ev?.requiredRoles) && ev.requiredRoles) ||
      (Array.isArray(ev?.roles) && ev.roles) ||
      [];

    console.log('Raw event roles data:', rolesRaw);

    const roles = rolesRaw
      .filter(Boolean)
      .map((r) => {
        console.log('Processing role:', r);
        console.log('Role slotLimit value:', r?.slotLimit, 'Type:', typeof r?.slotLimit);
        const slotLimit = r?.slotLimit ?? r?.slots ?? r?.limit ?? r?.capacity;
        const roleName = r?.roleName ?? r?.name ?? r?.role ?? r?.title;
        const takenByList = Array.isArray(r?.signups) ? r.signups.length : undefined;
        const takenSlots = r?.takenSlots ?? r?.signupsCount ?? r?.filledSlots ?? r?.taken ?? takenByList;
        const id = r?.id ?? r?.roleId ?? r?.eventRoleId;

        return {
          ...r,
          id,
          roleName,
          slotLimit,
          takenSlots,
        };
      });
    const hasParentSignup = getHasParentSignup(ev);
    if (!roles.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          No roles for this event.
        </Typography>
      );
    }

    return (
      <Stack spacing={1}>
        {roles.map((r) => {
          const roleId = r?.id;
          const slotLimit = Number(r.slotLimit) || 0;
          const taken = Number(r.takenSlots ?? r.signupsCount ?? r.filledSlots ?? 0) || 0;
          const available = Math.max(0, slotLimit - taken);
          
          // Check signup status for both parents and teachers
          const hasTeacherRoleSignup = getHasTeacherSignup(ev, roleId);
          const canParentClick = isParent && !hasParentSignup && canInteractWithEvent(ev) && available > 0 && !!roleId;
          const canTeacherClick = isTeacher && !hasTeacherRoleSignup && canInteractWithEvent(ev) && available > 0 && !!roleId;
          
          console.log('Event role debug:', {
            isParent,
            isTeacher,
            hasParentSignup,
            hasTeacherRoleSignup,
            canInteractWithEvent: canInteractWithEvent(ev),
            available,
            roleId,
            slotLimit,
            taken,
            canParentClick,
            canTeacherClick
          });

          return (
            <Card key={r.id || r.roleName} variant="outlined">
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="subtitle2">{r.roleName || 'Role'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Slots: {slotLimit} | Available: {available}
                    </Typography>
                    {(hasParentSignup || hasTeacherRoleSignup) && (
                      <Typography variant="caption" color="success.main">
                        ✓ You are signed up
                      </Typography>
                    )}
                  </Box>

                  {(isParent || isTeacher) && (
                    <Button
                      variant={hasParentSignup || hasTeacherRoleSignup ? "outlined" : "contained"}
                      color={hasParentSignup || hasTeacherRoleSignup ? "error" : "primary"}
                      startIcon={hasParentSignup || hasTeacherRoleSignup ? null : <PersonAddAltIcon />}
                      onClick={() => {
                        if (hasParentSignup || hasTeacherRoleSignup) {
                          if (isParent) parentCancel(ev);
                          else teacherCancelSignup(ev);
                        } else {
                          if (isParent) parentSignup(ev, roleId);
                          else teacherRoleSignup(ev, roleId);
                        }
                      }}
                      disabled={isParent ? !canParentClick : !canTeacherClick}
                      sx={{ minHeight: 44 }}
                    >
                      {hasParentSignup || hasTeacherRoleSignup ? 'Cancel' : 'Sign up'}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  };

  return (
    <Box>
      <PageTitle title="Events" subtitle="View upcoming school events" />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
        >
          <ToggleButton value="month" sx={{ minHeight: 44 }}>
            Month
          </ToggleButton>
          <ToggleButton value="agenda" sx={{ minHeight: 44 }}>
            Agenda
          </ToggleButton>
        </ToggleButtonGroup>

        {canCreateEvents && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openCreate(null)}
            sx={{ minHeight: 44 }}
          >
            Create event
          </Button>
        )}
      </Stack>

      {warning && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setApiFailed(false);
                loadEvents();
              }}
              sx={{ minHeight: 44 }}
            >
              Retry
            </Button>
          }
        >
          {warning}
        </Alert>
      )}

      {loading && <LoadingSpinner message="Loading events..." height={220} />}

      {!loading && viewMode === 'agenda' && (
        <Stack spacing={2}>
          {!agendaItems.length ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1">No events found.</Typography>
                <Typography variant="body2" color="text.secondary">
                  Events will appear here when they are created.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            agendaItems.map((ev) => {
              const status = deriveStatus(ev);
              
              // Detailed view for admin and teacher, simple view for others
              if (isAdmin || isTeacher) {
                return (
                  <Card key={ev.id} variant="outlined" onClick={() => openDetails(ev)} sx={{ cursor: 'pointer' }}>
                    <CardContent sx={{ py: 3, '&:last-child': { pb: 3 } }}>
                      <Stack spacing={2}>
                        {/* Event Title and Status */}
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                          <Typography variant="h5" sx={{ fontWeight: 600, mr: 1 }}>
                            {ev.title || 'Untitled event'}
                          </Typography>
                          <Chip label={status} color={getStatusColor(status)} size="medium" />
                        </Stack>
                        
                        {/* Detailed Information */}
                        <Box sx={{ pl: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                            {status}
                          </Typography>
                          
                          {ev.location && (
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                              Location: {ev.location}
                            </Typography>
                          )}
                          
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            Date & Time: {format(ev._start, 'dd/MM/yyyy, HH:mm')} – {format(ev._end, 'dd/MM/yyyy, HH:mm')}
                          </Typography>
                          
                          {ev.roles && ev.roles.length > 0 && (
                            <Box>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                                Role/s: {ev.roles.map(r => r.roleName || r.name).join(', ')}
                              </Typography>
                              
                              {/* Show participation details for each role */}
                              {ev.roles.map((role, idx) => (
                                <Typography key={idx} variant="body2" color="text.secondary" sx={{ ml: 2, mb: 0.5 }}>
                                  • {role.roleName || role.name}: {role.takenSlots || role.signupsCount || 0}/{role.slotLimit || 0} participants
                                </Typography>
                              ))}
                              
                              {/* Show teacher attendance if available */}
                              {ev.teacherAttendance && ev.teacherAttendance.length > 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 2, mt: 1 }}>
                                  📚 Teachers attending: {ev.teacherAttendance.length}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              } else {
                // Simple view for parents and students (original format)
                return (
                  <Card key={ev.id} variant="outlined" onClick={() => openDetails(ev)} sx={{ cursor: 'pointer' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                          <Typography variant="h6" sx={{ mr: 1 }}>
                            {ev.title || 'Untitled event'}
                          </Typography>
                          <Chip label={status} color={getStatusColor(status)} size="small" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {format(ev._start, 'dd/MM/yyyy, HH:mm')} – {format(ev._end, 'HH:mm')}
                        </Typography>
                        {ev.location && (
                          <Typography variant="body2" color="text.secondary">
                            📍 {ev.location}
                          </Typography>
                        )}
                        
                        {/* Show roles in brief overview */}
                        {ev.roles && ev.roles.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              🎭 Roles: {ev.roles.map(r => r.roleName || r.name).join(', ')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {ev.roles.reduce((total, role) => total + (role.takenSlots || role.signupsCount || 0), 0)} participants total
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Action Buttons for Parents and Students */}
                        {!isAdmin && !isTeacher && canInteractWithEvent(ev) && (
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Button 
                              size="small" 
                              variant="outlined"
                              startIcon={<HowToRegIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                                setRsvpDialogOpen(true);
                              }}
                            >
                              RSVP
                            </Button>
                            {ev.sponsorshipEnabled && (
                              <Button 
                                size="small" 
                                variant="outlined"
                                color="secondary"
                                startIcon={<AttachMoneyIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEvent(ev);
                                  setSponsorshipDialogOpen(true);
                                }}
                              >
                                Sponsor
                              </Button>
                            )}
                            <Button 
                              size="small" 
                              variant="contained"
                              startIcon={<VolunteerActivismIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                                setVolunteerDialogOpen(true);
                              }}
                              disabled={hasUserSignedUp()}
                            >
                              {hasUserSignedUp() ? 'Signed Up' : 'Volunteer'}
                            </Button>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              }
            })
          )}
        </Stack>
      )}

      {!loading && viewMode === 'month' && (
        <Box sx={{ height: { xs: 520, md: 680 }, '& .rbc-toolbar button': { minHeight: 44 } }}>
          <BigCalendar
            localizer={localizer}
            events={rbcEvents}
            startAccessor="start"
            endAccessor="end"
            views={['month']}
            defaultView="month"
            date={anchorDate}
            onNavigate={(d) => setAnchorDate(d)}
            selectable={canCreateEvents}
            onSelectEvent={(ev) => openDetails(ev)}
            onSelectSlot={(slotInfo) => canCreateEvents && openCreate(slotInfo)}
            popup
          />
        </Box>
      )}

      <Dialog open={detailsOpen} onClose={closeDetails} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          {selectedEvent?.title || 'Event'}
          <IconButton aria-label="close" onClick={closeDetails} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!selectedEvent ? null : (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip label={deriveStatus(selectedEvent)} color={getStatusColor(deriveStatus(selectedEvent))} size="small" />
                {selectedEvent.eventType && <Chip label={selectedEvent.eventType} size="small" variant="outlined" />}
                {selectedEvent.location ? <Chip label={selectedEvent.location} size="small" variant="outlined" /> : null}
                {selectedEvent.sponsorshipEnabled && <Chip label="Sponsorship Enabled" size="small" color="secondary" />}
              </Stack>

              <Box>
                <Typography variant="subtitle2">When</Typography>
                <Typography variant="body2" color="text.secondary">
                  {toSafeDate(selectedEvent.startDate) ? format(toSafeDate(selectedEvent.startDate), 'dd/MM/yyyy, HH:mm') : '—'}
                  {' '}–{' '}
                  {toSafeDate(selectedEvent.endDate) ? format(toSafeDate(selectedEvent.endDate), 'dd/MM/yyyy, HH:mm') : '—'}
                </Typography>
              </Box>

              {selectedEvent.organizer && (
                <Box>
                  <Typography variant="subtitle2">Organizer</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {availableOrganizers.find(o => o.id === selectedEvent.organizer)?.name || selectedEvent.organizer}
                  </Typography>
                </Box>
              )}

              {selectedEvent.maxAttendees && (
                <Box>
                  <Typography variant="subtitle2">Capacity</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.maxAttendees} attendees maximum
                  </Typography>
                </Box>
              )}

              {selectedEvent.description ? (
                <Box>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedEvent.description}
                  </Typography>
                </Box>
              ) : null}

              {/* Enhanced Action Buttons for Parents and Students */}
              {!isAdmin && !isTeacher && canInteractWithEvent(selectedEvent) && (
                <>
                  <Divider />
                  <Typography variant="subtitle1">Participate in Event</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<HowToRegIcon />}
                      onClick={() => setRsvpDialogOpen(true)}
                      sx={{ minHeight: 44 }}
                    >
                      {getUserRSVP() ? `Update RSVP (${getUserRSVP().response})` : 'RSVP'}
                    </Button>
                    {selectedEvent.sponsorshipEnabled && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<AttachMoneyIcon />}
                        onClick={() => setSponsorshipDialogOpen(true)}
                        sx={{ minHeight: 44 }}
                      >
                        Sponsor Event
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<VolunteerActivismIcon />}
                      onClick={() => setVolunteerDialogOpen(true)}
                      disabled={hasUserSignedUp()}
                      sx={{ minHeight: 44 }}
                    >
                      {hasUserSignedUp() ? 'Already Signed Up' : 'Volunteer'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ShareIcon />}
                      onClick={() => setShareDialogOpen(true)}
                      sx={{ minHeight: 44 }}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExport}
                      sx={{ minHeight: 44 }}
                    >
                      Export
                    </Button>
                  </Stack>
                </>
              )}

              {/* Event Statistics */}
              {selectedEvent && (
                <>
                  <Divider />
                  <Typography variant="subtitle1">Event Statistics</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary.main">
                          {selectedEvent.rsvps?.filter(r => r.response === 'attending').length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Attending
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {selectedEvent.roles?.reduce((total, role) => total + (role.takenSlots || 0), 0) || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Volunteers
                        </Typography>
                      </Box>
                    </Grid>
                    {selectedEvent.sponsorshipEnabled && (
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="secondary.main">
                            {selectedEvent.sponsorships?.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sponsors
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Detailed Statistics for Admins */}
                  {(isAdmin || isTeacher) && (
                    <>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Total RSVPs: {selectedEvent.rsvps?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              (Attending: {selectedEvent.rsvps?.filter(r => r.response === 'attending').length || 0}, 
                              Declined: {selectedEvent.rsvps?.filter(r => r.response === 'declined').length || 0}, 
                              Maybe: {selectedEvent.rsvps?.filter(r => r.response === 'maybe').length || 0})
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Volunteer Slots: {selectedEvent.roles?.reduce((total, role) => total + (role.takenSlots || 0), 0) || 0} / 
                              {selectedEvent.roles?.reduce((total, role) => total + (role.slotLimit || 0), 0) || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {selectedEvent.roles?.length || 0} roles available
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Sponsorship Details */}
                      {selectedEvent.sponsorshipEnabled && selectedEvent.sponsorships && selectedEvent.sponsorships.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Recent Sponsorships</Typography>
                          <Stack spacing={1}>
                            {selectedEvent.sponsorships.slice(0, 3).map((sponsorship) => (
                              <Typography key={sponsorship.id} variant="caption" color="text.secondary">
                                • {sponsorship.isAnonymous ? 'Anonymous' : sponsorship.parentName || 'Unknown'}: 
                                {sponsorship.pledgeType === 'monetary' ? ` R${sponsorship.pledgeAmount || 0}` : ` ${sponsorship.pledgeDescription || 'Goods/Services'}`}
                              </Typography>
                            ))}
                            {selectedEvent.sponsorships.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                ... and {selectedEvent.sponsorships.length - 3} more
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}

              {isParent && (
                <>
                  <Divider />
                  <Typography variant="subtitle1">Role slots</Typography>
                  {renderEventRoles(selectedEvent)}

                  {getHasParentSignup(selectedEvent) ? (
                    <Typography variant="body2" color="text.secondary">
                      You are currently signed up for this event.
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      You are not signed up for this event.
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    onClick={() => parentCancel(selectedEvent)}
                    disabled={!canInteractWithEvent(selectedEvent) || !getHasParentSignup(selectedEvent)}
                    sx={{ minHeight: 44, alignSelf: 'flex-start' }}
                  >
                    Cancel my participation
                  </Button>
                </>
              )}

              {isTeacher && (
                <>
                  <Divider />
                  <Typography variant="subtitle1">Attendance</Typography>
                  <Grid container spacing={1}>
                    {['PENDING', 'ATTENDING', 'NOT_ATTENDING'].map((s) => (
                      <Grid item xs={12} sm={4} key={s}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => teacherSetStatus(selectedEvent, s)}
                          disabled={!canInteractWithEvent(selectedEvent)}
                          sx={{ minHeight: 44 }}
                        >
                          {s.replace('_', ' ')}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ mt: 2, mb: 1 }} />
                  <Typography variant="subtitle1">Participate as Role</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Sign up to participate in a specific role for this event.
                  </Typography>
                  {renderEventRoles(selectedEvent)}
                  
                  {getTeacherSignupRoleId(selectedEvent) && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => teacherCancelSignup(selectedEvent)}
                        disabled={!canInteractWithEvent(selectedEvent)}
                        sx={{ minHeight: 44 }}
                      >
                        Cancel my role participation
                      </Button>
                    </Box>
                  )}
                </>
              )}

                          </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
            <Button onClick={closeDetails} variant="outlined" sx={{ minHeight: 44 }}>
              Close
            </Button>

            {(isAdmin || isTeacher) && selectedEvent && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ ml: 'auto', width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    closeDetails();
                    openEdit(selectedEvent);
                  }}
                  sx={{ minHeight: 44 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => confirmDelete(selectedEvent)}
                  sx={{ minHeight: 44 }}
                >
                  Delete
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6 }}>
          {editMode === 'create' ? 'Create event' : 'Edit event'}
          <IconButton aria-label="close" onClick={closeEdit} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!canCreateEvents ? (
            <Typography variant="body2" color="text.secondary">
              Only admins and teachers can create or edit events.
            </Typography>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description & Requirements"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    multiline
                    minRows={3}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                    <DateTimePicker
                      label="Start"
                      value={formData.startDate ? new Date(formData.startDate) : null}
                      onChange={(value) =>
                        setFormData((p) => ({ ...p, startDate: value ? toDateTimeLocalInputValue(value) : '' }))
                      }
                      format="dd/MM/yyyy HH:mm"
                      slotProps={{
                        textField: { fullWidth: true },
                        popper: { disablePortal: true },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                    <DateTimePicker
                      label="End"
                      value={formData.endDate ? new Date(formData.endDate) : null}
                      onChange={(value) =>
                        setFormData((p) => ({ ...p, endDate: value ? toDateTimeLocalInputValue(value) : '' }))
                      }
                      format="dd/MM/yyyy HH:mm"
                      slotProps={{
                        textField: { fullWidth: true },
                        popper: { disablePortal: true },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Organizer</InputLabel>
                    <Select
                      value={formData.organizer}
                      label="Organizer"
                      onChange={(e) => setFormData((p) => ({ ...p, organizer: e.target.value }))}
                    >
                      {availableOrganizers.map((organizer) => (
                        <MenuItem key={organizer.id} value={organizer.id}>
                          {organizer.name} ({organizer.role})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={formData.eventType}
                      label="Event Type"
                      onChange={(e) => setFormData((p) => ({ ...p, eventType: e.target.value }))}
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      <MenuItem value="academic">Academic</MenuItem>
                      <MenuItem value="sports">Sports</MenuItem>
                      <MenuItem value="cultural">Cultural</MenuItem>
                      <MenuItem value="social">Social</MenuItem>
                      <MenuItem value="fundraising">Fundraising</MenuItem>
                      <MenuItem value="meeting">Meeting</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Attendees"
                    type="number"
                    value={formData.maxAttendees || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, maxAttendees: e.target.value ? parseInt(e.target.value) : null }))}
                    inputProps={{ min: 1 }}
                    helperText="Leave empty for unlimited attendees"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.sponsorshipEnabled}
                        onChange={(e) => setFormData((p) => ({ ...p, sponsorshipEnabled: e.target.checked }))}
                      />
                    }
                    label="Enable Sponsorship Pledges"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Status"
                    select
                    value={(formData.status ?? '').toString().trim().toLowerCase() === 'cancelled' ? 'Cancelled' : ''}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                    helperText={`Auto: ${derivedFormStatus}`}
                  >
                    <MenuItem value="">Auto (Upcoming/Past)</MenuItem>
                    <MenuItem value="Cancelled" disabled={editMode === 'create'}>
                      Cancelled
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="subtitle1">Roles</Typography>
                    <Button variant="outlined" onClick={addRoleRow} sx={{ minHeight: 44 }}>
                      Add role
                    </Button>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Optional role slots for parents to sign up.
                  </Typography>

                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {(formData.roles || []).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No roles added.
                      </Typography>
                    ) : (
                      (formData.roles || []).map((r, idx) => (
                        <Card key={r.clientId ?? `${idx}-${r.id ?? 'role'}`} variant="outlined">
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={7}>
                                <TextField
                                  fullWidth
                                  label="Role name"
                                  value={r.roleName}
                                  onChange={(e) => upsertRoleRow(idx, { roleName: e.target.value })}
                                />
                              </Grid>
                              <Grid item xs={9} sm={4}>
                                <TextField
                                  fullWidth
                                  label="Slot limit"
                                  type="number"
                                  inputProps={{ min: 0 }}
                                  value={r.slotLimit}
                                  onChange={(e) => upsertRoleRow(idx, { slotLimit: e.target.value })}
                                />
                              </Grid>
                              <Grid item xs={3} sm={1}>
                                <IconButton onClick={() => removeRoleRow(idx)} aria-label="remove role">
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
            <Button variant="outlined" onClick={closeEdit} sx={{ minHeight: 44 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={submitEvent}
              disabled={!canCreateEvents}
              sx={{ minHeight: 44, ml: 'auto' }}
            >
              Save
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // RSVP Dialog
  const renderRSVPDialog = () => (
    <Dialog open={rsvpDialogOpen} onClose={() => setRsvpDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>RSVP for {selectedEvent?.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Will you attend?</InputLabel>
            <Select
              value={rsvpData.response}
              label="Will you attend?"
              onChange={(e) => setRsvpData({ ...rsvpData, response: e.target.value })}
            >
              <MenuItem value="attending">Yes, I'll be there</MenuItem>
              <MenuItem value="declined">No, I can't make it</MenuItem>
              <MenuItem value="maybe">Maybe</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Number of Guests"
            type="number"
            value={rsvpData.numberOfGuests}
            onChange={(e) => setRsvpData({ ...rsvpData, numberOfGuests: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0 }}
          />
          
          <TextField
            fullWidth
            label="Dietary Requirements"
            multiline
            rows={2}
            value={rsvpData.dietaryRequirements}
            onChange={(e) => setRsvpData({ ...rsvpData, dietaryRequirements: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Special Requests"
            multiline
            rows={2}
            value={rsvpData.specialRequests}
            onChange={(e) => setRsvpData({ ...rsvpData, specialRequests: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRsvpDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleRSVP} variant="contained">Submit RSVP</Button>
      </DialogActions>
    </Dialog>
  );

  // Sponsorship Dialog
  const renderSponsorshipDialog = () => (
    <Dialog open={sponsorshipDialogOpen} onClose={() => setSponsorshipDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Sponsor {selectedEvent?.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Pledge Type</InputLabel>
            <Select
              value={sponsorshipData.pledgeType}
              label="Pledge Type"
              onChange={(e) => setSponsorshipData({ ...sponsorshipData, pledgeType: e.target.value })}
            >
              <MenuItem value="monetary">Monetary Donation</MenuItem>
              <MenuItem value="goods">Goods/Products</MenuItem>
              <MenuItem value="services">Services</MenuItem>
            </Select>
          </FormControl>
          
          {sponsorshipData.pledgeType === 'monetary' && (
            <TextField
              fullWidth
              label="Amount (R)"
              type="number"
              value={sponsorshipData.pledgeAmount}
              onChange={(e) => setSponsorshipData({ ...sponsorshipData, pledgeAmount: e.target.value })}
              inputProps={{ min: 0 }}
            />
          )}
          
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={sponsorshipData.pledgeDescription}
            onChange={(e) => setSponsorshipData({ ...sponsorshipData, pledgeDescription: e.target.value })}
            placeholder={
              sponsorshipData.pledgeType === 'monetary' 
                ? 'Describe your sponsorship (optional)'
                : 'Describe the goods or services you can provide'
            }
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={sponsorshipData.isAnonymous}
                onChange={(e) => setSponsorshipData({ ...sponsorshipData, isAnonymous: e.target.checked })}
              />
            }
            label="Make this pledge anonymous"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSponsorshipDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleSponsorship} variant="contained">Submit Pledge</Button>
      </DialogActions>
    </Dialog>
  );

  // Volunteer Dialog
  const renderVolunteerDialog = () => (
    <Dialog open={volunteerDialogOpen} onClose={() => setVolunteerDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Volunteer for {selectedEvent?.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={volunteerData.roleId}
              label="Select Role"
              onChange={(e) => setVolunteerData({ ...volunteerData, roleId: e.target.value })}
            >
              {selectedEvent?.roles?.filter(role => {
                const taken = role.takenSlots || 0;
                const limit = role.slotLimit || 0;
                return taken < limit;
              }).map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.roleName} ({role.takenSlots || 0}/{role.slotLimit || 0} slots filled)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Relevant Experience"
                multiline
                rows={3}
                value={volunteerData.notes}
                onChange={(e) => setVolunteerData({ ...volunteerData, notes: e.target.value })}
                placeholder="Tell us about your relevant experience or skills for this role"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Skills & Qualifications"
                multiline
                rows={3}
                value={volunteerData.skills || ''}
                onChange={(e) => setVolunteerData({ ...volunteerData, skills: e.target.value })}
                placeholder="List any relevant skills, certifications, or qualifications"
              />
            </Grid>
          </Grid>
          
          <FormControl fullWidth>
            <InputLabel>Time Preferences</InputLabel>
            <Select
              multiple
              value={volunteerData.timePreferences || []}
              label="Time Preferences"
              onChange={(e) => setVolunteerData({ ...volunteerData, timePreferences: e.target.value })}
              renderValue={(selected) => selected.join(', ')}
            >
              <MenuItem value="morning">Morning (6AM - 12PM)</MenuItem>
              <MenuItem value="afternoon">Afternoon (12PM - 6PM)</MenuItem>
              <MenuItem value="evening">Evening (6PM - 10PM)</MenuItem>
              <MenuItem value="flexible">Flexible</MenuItem>
              <MenuItem value="weekend">Weekend Only</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Emergency Contact"
            value={volunteerData.emergencyContact}
            onChange={(e) => setVolunteerData({ ...volunteerData, emergencyContact: e.target.value })}
            placeholder="Name and phone number"
          />
          
          <TextField
            fullWidth
            label="Special Requirements or Notes"
            multiline
            rows={2}
            value={volunteerData.specialRequirements || ''}
            onChange={(e) => setVolunteerData({ ...volunteerData, specialRequirements: e.target.value })}
            placeholder="Any special requirements, dietary needs, or additional notes"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setVolunteerDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleVolunteerSignup} variant="contained">Sign Up</Button>
      </DialogActions>
    </Dialog>
  );

  // Share Dialog
  const renderShareDialog = () => (
    <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Share Event</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Event Link"
            value={window.location.href}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  enqueueSnackbar('Link copied to clipboard', { variant: 'success' });
                }}>
                  Copy
                </Button>
              )
            }}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Share this event with other parents, teachers, and students
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        <Button onClick={handleShare} variant="contained" startIcon={<ShareIcon />}>
          Share
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      {content}
      {renderRSVPDialog()}
      {renderSponsorshipDialog()}
      {renderVolunteerDialog()}
      {renderShareDialog()}
    </>
  );
};

export default EventsPage;
