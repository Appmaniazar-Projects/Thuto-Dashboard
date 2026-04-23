
import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Typography, Chip, Card, CardContent, Stack } from '@mui/material';
import { getEvents } from '../../../services/eventService';
import { format } from 'date-fns';

const EventsPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   fetchCalendarEvents().then((res) => {
  //     setEvents(res.data || []);
  //   });
  // }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const eventsData = await getEvents();
        
        if (isMounted) setEvents(eventsData || []);
      } catch (e) {
        if (isMounted) {
          setEvents([]);
          setError(e?.response?.data?.message || e?.message || 'Failed to load events');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const deriveStatus = (ev) => {
    const now = new Date();
    const start = ev._start;
    const end = ev._end || ev.endDate ? new Date(ev.endDate) : null;
    
    if (!start) return 'UNKNOWN';
    
    if (start > now) return 'UPCOMING';
    if (end && end < now) return 'COMPLETED';
    if (start <= now && (!end || end >= now)) return 'ONGOING';
    return 'UNKNOWN';
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING': return 'primary';
      case 'ONGOING': return 'success';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const upcoming = useMemo(() => {
    const now = Date.now();
    return (events || [])
      .map((ev) => ({
        ...ev,
        _start: ev?.startDate ? new Date(ev.startDate) : ev?.date ? new Date(ev.date) : null,
        _end: ev?.endDate ? new Date(ev.endDate) : null,
      }))
      .filter((ev) => ev._start && !Number.isNaN(ev._start.getTime()))
      .filter((ev) => ev._start.getTime() >= now - 24 * 60 * 60 * 1000)
      .sort((a, b) => a._start - b._start)
      .slice(0, 5);
  }, [events]);

  return (
    <Paper sx={{ p: 2, height: 380, overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Upcoming Events
      </Typography>

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      ) : upcoming.length ? (
        <Stack spacing={2}>
          {upcoming.map((ev) => {
            const status = deriveStatus(ev);
            return (
              <Card key={ev.id} variant="outlined" sx={{ cursor: 'pointer' }}>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {ev.title || 'Untitled event'}
                      </Typography>
                      <Chip label={status} color={getStatusColor(status)} size="small" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {format(ev._start, 'dd/MM/yyyy, HH:mm')} – {ev._end ? format(ev._end, 'HH:mm') : 'No end time'}
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
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No upcoming events found.
        </Typography>
      )}
    </Paper>
  );
};

export default EventsPanel;
