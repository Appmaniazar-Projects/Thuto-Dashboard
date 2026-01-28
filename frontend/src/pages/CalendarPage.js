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
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
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
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PageTitle from '../components/common/PageTitle';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  cancelEventSignup,
  createEvent,
  deleteEvent,
  getEvents,
  setTeacherAttendanceStatus,
  signUpForEventRole,
  updateEvent,
} from '../services/calendarService';
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

const CalendarPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const role = (currentUser?.role ?? '').toString().toLowerCase();
  const isAdmin = role === 'admin' || role === 'administrator';
  const isParent = role === 'parent';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  const [viewMode, setViewMode] = useState(isMobile ? 'agenda' : 'month');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [apiFailed, setApiFailed] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
    roles: [],
  });

  useEffect(() => {
    setViewMode(isMobile ? 'agenda' : 'month');
  }, [isMobile]);

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
    if (!apiFailed) {
      loadEvents();
    }
  }, [apiFailed, loadEvents]);

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
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedEvent(null);
  };

  const openCreate = (slotInfo) => {
    setEditMode('create');
    setFormData({
      id: null,
      title: '',
      description: '',
      startDate: slotInfo?.start ? toDateTimeLocalInputValue(slotInfo.start) : '',
      endDate: slotInfo?.end ? toDateTimeLocalInputValue(slotInfo.end) : '',
      location: '',
      status: '',
      roles: [],
    });
    setEditOpen(true);
  };

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
      roles: Array.isArray(ev.roles) ? ev.roles.map(r => ({ id: r.id, roleName: r.roleName || '', slotLimit: r.slotLimit ?? 0 })) : [],
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
      roles: [...(prev.roles || []), { id: undefined, roleName: '', slotLimit: 1 }],
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
      if (!isAdmin) return;

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
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: formData.location || '',
        status: (formData.status || '').trim(),
        roles: (formData.roles || []).map(r => ({
          id: r.id,
          roleName: (r.roleName || '').trim(),
          slotLimit: Number(r.slotLimit) || 0,
        })),
      };

      if (editMode === 'create') {
        await createEvent(payload);
        enqueueSnackbar('Event created', { variant: 'success' });
      } else {
        await updateEvent(formData.id, payload);
        enqueueSnackbar('Event updated', { variant: 'success' });
      }

      closeEdit();
      await loadEvents();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to save event', { variant: 'error' });
    }
  };

  const confirmDelete = async (ev) => {
    if (!isAdmin) return;
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
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to cancel signup', { variant: 'error' });
    }
  };

  const teacherSetStatus = async (ev, status) => {
    try {
      await setTeacherAttendanceStatus(ev.id, status);
      enqueueSnackbar('Attendance updated', { variant: 'success' });
      await loadEvents();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to update attendance', { variant: 'error' });
    }
  };

  const renderEventRoles = (ev) => {
    const roles = Array.isArray(ev?.roles) ? ev.roles : [];
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
          const slotLimit = Number(r.slotLimit) || 0;
          const taken = Number(r.takenSlots ?? r.signupsCount ?? r.filledSlots ?? 0) || 0;
          const available = Math.max(0, slotLimit - taken);
          const canClick = isParent && !hasParentSignup && canInteractWithEvent(ev) && available > 0;

          return (
            <Card key={r.id || r.roleName} variant="outlined">
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="subtitle2">{r.roleName || 'Role'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Slots: {slotLimit} | Available: {available}
                    </Typography>
                  </Box>

                  {isParent && (
                    <Button
                      variant="contained"
                      startIcon={<PersonAddAltIcon />}
                      onClick={() => parentSignup(ev, r.id)}
                      disabled={!canClick}
                      sx={{ minHeight: 44 }}
                    >
                      Sign up
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

        {isAdmin && (
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
                        {format(ev._start, 'EEE, dd MMM yyyy HH:mm')} – {format(ev._end, 'HH:mm')}
                      </Typography>
                      {ev.location && (
                        <Typography variant="body2" color="text.secondary">
                          {ev.location}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
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
            view="month"
            date={anchorDate}
            onNavigate={(d) => setAnchorDate(d)}
            selectable={isAdmin}
            onSelectEvent={(ev) => openDetails(ev)}
            onSelectSlot={(slotInfo) => isAdmin && openCreate(slotInfo)}
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
                {selectedEvent.location ? <Chip label={selectedEvent.location} size="small" variant="outlined" /> : null}
              </Stack>

              <Box>
                <Typography variant="subtitle2">When</Typography>
                <Typography variant="body2" color="text.secondary">
                  {toSafeDate(selectedEvent.startDate) ? format(toSafeDate(selectedEvent.startDate), 'EEE, dd MMM yyyy HH:mm') : '—'}
                  {' '}–{' '}
                  {toSafeDate(selectedEvent.endDate) ? format(toSafeDate(selectedEvent.endDate), 'EEE, dd MMM yyyy HH:mm') : '—'}
                </Typography>
              </Box>

              {selectedEvent.description ? (
                <Box>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedEvent.description}
                  </Typography>
                </Box>
              ) : null}

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
                </>
              )}

              {isStudent && (
                <Typography variant="body2" color="text.secondary">
                  You can view events, but you cannot sign up or edit.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
            <Button onClick={closeDetails} variant="outlined" sx={{ minHeight: 44 }}>
              Close
            </Button>

            {isAdmin && selectedEvent && (
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
          {!isAdmin ? (
            <Typography variant="body2" color="text.secondary">
              Only admins can create or edit events.
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
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    multiline
                    minRows={3}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                    value={formData.startDate}
                    onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                    value={formData.endDate}
                    onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                  />
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
                  <TextField
                    fullWidth
                    label="Status (optional)"
                    placeholder="Upcoming / Cancelled / Past"
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  />
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
                        <Card key={`${idx}-${r.id || r.roleName || 'role'}`} variant="outlined">
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
              disabled={!isAdmin}
              sx={{ minHeight: 44, ml: 'auto' }}
            >
              Save
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;
