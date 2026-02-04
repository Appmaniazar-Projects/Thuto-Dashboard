
import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { fetchEvents } from '../../../services/api';

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
        const res = await fetchEvents();
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.events)
            ? data.events
            : Array.isArray(data?.data)
              ? data.data
              : [];

        if (isMounted) setEvents(list);
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

  const upcoming = useMemo(() => {
    const now = Date.now();
    return (events || [])
      .map((ev) => ({
        ...ev,
        _start: ev?.startDate ? new Date(ev.startDate) : ev?.date ? new Date(ev.date) : null,
      }))
      .filter((ev) => ev._start && !Number.isNaN(ev._start.getTime()))
      .filter((ev) => ev._start.getTime() >= now - 24 * 60 * 60 * 1000)
      .sort((a, b) => a._start - b._start)
      .slice(0, 6);
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
        upcoming.map((event, idx) => (
          <Typography key={event?.id ?? idx} variant="body2" sx={{ mb: 1 }}>
            {(event?.title || 'Untitled event').toString()}
          </Typography>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No events found.
        </Typography>
      )}
    </Paper>
  );
};

export default EventsPanel;
