import api from './api';

const EVENTS_BASE = '/events';

const getCurrentUserId = () => {
  const storedUser = localStorage.getItem('user');

  try {
    const userInfo = storedUser ? JSON.parse(storedUser) : null;
    const id = userInfo?.id ?? userInfo?.userId ?? userInfo?.phoneNumber ?? null;
    if (!id) {
      throw new Error('User ID not found. Please log in again.');
    }
    return id;
  } catch (e) {
    throw new Error('User ID not found. Please log in again.');
  }
};

const getCurrentSchoolId = () => {
  const storedUser = localStorage.getItem('user');
  let schoolId = localStorage.getItem('schoolId');

  try {
    const userInfo = storedUser ? JSON.parse(storedUser) : null;
    if (userInfo?.schoolId) schoolId = userInfo.schoolId;
  } catch (e) {
    // ignore
  }

  if (!schoolId) {
    throw new Error('School ID not found. Please log in again.');
  }

  return schoolId;
};

const coerceEventsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;
  return [];
};

const normalizeEventPayload = (eventData) => {
  if (!eventData || typeof eventData !== 'object') return eventData;

  const payload = { ...eventData };

  const normalizeDateString = (value) => {
    if (!value) return value;
    const s = String(value);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return `${s}:00`;
    return s;
  };

  if (payload.startDate instanceof Date) payload.startDate = payload.startDate.toISOString();
  if (payload.endDate instanceof Date) payload.endDate = payload.endDate.toISOString();
  if (typeof payload.startDate === 'string') payload.startDate = normalizeDateString(payload.startDate);
  if (typeof payload.endDate === 'string') payload.endDate = normalizeDateString(payload.endDate);

  if (!Array.isArray(payload.roles)) {
    delete payload.roles;
  } else {
    payload.roles = payload.roles
      .filter(r => r && typeof r === 'object')
      .map(r => ({
        id: r.id ?? undefined,
        roleName: (r.roleName ?? '').toString().trim(),
        slotLimit: Number.isFinite(Number(r.slotLimit)) ? Number(r.slotLimit) : 0,
      }))
      .filter(r => r.roleName);
  }

  return payload;
};

// Get all events for a specific date range
export const getEvents = async (startDate, endDate) => {
  try {
    const schoolId = getCurrentSchoolId();
    const response = await api.get(`${EVENTS_BASE}/${schoolId}`);
    const events = coerceEventsArray(response.data);

    if (!startDate && !endDate) return events;

    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    const fromTime = from && !Number.isNaN(from.getTime()) ? from.getTime() : null;
    const toTime = to && !Number.isNaN(to.getTime()) ? to.getTime() : null;

    return events.filter((ev) => {
      const start = new Date(ev?.startDate);
      const end = new Date(ev?.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
      const startT = start.getTime();
      const endT = end.getTime();

      if (fromTime !== null && endT < fromTime) return false;
      if (toTime !== null && startT > toTime) return false;
      return true;
    });
  } catch (error) {
    throw error;
  }
};

// Get a single event (with roles/signups/attendance if backend supports it)
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`${EVENTS_BASE}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const payload = normalizeEventPayload(eventData);
    if (payload && typeof payload === 'object' && !payload.schoolId) {
      try {
        payload.schoolId = getCurrentSchoolId();
      } catch (e) {
        // ignore
      }
    }

    if (payload && typeof payload === 'object' && !payload.userId) {
      try {
        payload.userId = getCurrentUserId();
      } catch (e) {
        // ignore
      }
    }

    const response = await api.post(`${EVENTS_BASE}/create`, payload);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status >= 500) {
      console.error('Error creating event (server error). Payload sent:', eventData);
    }
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const payload = normalizeEventPayload({ ...eventData, id: eventId });
    if (payload && typeof payload === 'object' && !payload.schoolId) {
      try {
        payload.schoolId = getCurrentSchoolId();
      } catch (e) {
        // ignore
      }
    }

    if (payload && typeof payload === 'object' && !payload.userId) {
      try {
        payload.userId = getCurrentUserId();
      } catch (e) {
        // ignore
      }
    }

    const response = await api.put(`/events/update/${eventId}`, payload);
    console.log('Update event request successful:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error.response || error);
    throw error;
  }
};

export const cancelEvent = async (eventId, schoolIdOverride = null) => {
  try {
    const schoolId = schoolIdOverride || getCurrentSchoolId();
    const response = await api.put(`${EVENTS_BASE}/${eventId}/${schoolId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling event:', error);
    throw error;
  }
};

// Delete an event (mapped to cancel endpoint)
export const deleteEvent = async (eventId) => {
  try {
    await api.delete(`${EVENTS_BASE}/remove/${eventId}`);
    return eventId;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event types (if they're dynamic)
export const getEventTypes = async () => {
  try {
    const response = await api.get(`${EVENTS_BASE}/event-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    return []; // Return default event types if API fails
  }
};

// Parent sign up for a role slot
export const signUpForEventRole = async (eventId, roleId) => {
  try {
    const response = await api.post(`${EVENTS_BASE}/${eventId}/roles/${roleId}/signup`);
    return response.data;
  } catch (error) {
    console.error('Error signing up for event role:', error);
    throw error;
  }
};

export const cancelEventSignup = async (eventId) => {
  try {
    const response = await api.post(`${EVENTS_BASE}/${eventId}/signup/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling event signup:', error);
    throw error;
  }
};

// Teacher attendance status
export const setTeacherAttendanceStatus = async (eventId, status) => {
  try {
    const response = await api.put(`${EVENTS_BASE}/${eventId}/teacher-attendance`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating teacher attendance:', error);
    throw error;
  }
};
