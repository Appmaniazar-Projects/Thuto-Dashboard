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
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.items)) return data.items;
  // Add more potential response formats as needed
  console.log('Unable to extract events array from response:', data);
  return [];
};

const normalizeEventDates = (event) => {
  if (!event) return event;
  
  // If backend returns separate LocalDate and LocalTime fields, combine them
  if (event.startDate && event.startTime && !event.startDate.includes('T')) {
    return {
      ...event,
      startDate: `${event.startDate}T${event.startTime}`,
      endDate: `${event.endDate}T${event.endTime}`,
    };
  }
  
  return event;
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
    
    // Normalize dates if backend returns separate LocalDate/LocalTime
    const normalizedEvents = events.map(normalizeEventDates);
    console.log('Normalized events:', normalizedEvents);

    if (!startDate && !endDate) return normalizedEvents;

    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    const fromTime = from && !Number.isNaN(from.getTime()) ? from.getTime() : null;
    const toTime = to && !Number.isNaN(to.getTime()) ? to.getTime() : null;

    return normalizedEvents.filter((ev) => {
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
    console.log('Updated event data from backend:', response.data);
    
    // Normalize dates if backend returns separate LocalDate/LocalTime
    const normalizedEvent = normalizeEventDates(response.data);
    console.log('Normalized updated event:', normalizedEvent);
    
    return normalizedEvent;
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
    console.log('signUpForEventRole - Using UPDATED code without manual schoolId');
    console.log('signUpForEventRole - Endpoint:', `${EVENTS_BASE}/${eventId}/roles/${roleId}/signup`);
    const response = await api.post(`${EVENTS_BASE}/${eventId}/roles/${roleId}/signup`);
    console.log('signUpForEventRole - Success:', response.status);
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
    // Get required IDs with fallback
    let schoolId = localStorage.getItem('schoolId');
    let userId = null;
    
    // Try to get schoolId and userId from user object
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      schoolId = schoolId || user?.schoolId;
      userId = user?.id || user?.userId || user?.phoneNumber;
    } catch (e) {
      console.warn('Failed to parse user from localStorage:', e);
    }
    
    if (!schoolId) {
      throw new Error('School ID is required for teacher attendance update');
    }
    
    if (!userId) {
      throw new Error('User ID is required for teacher attendance update');
    }
    
    console.log('Updating teacher attendance:', { eventId, status, schoolId, userId });
    
  
    const endpoint = `/events/${eventId}/teacher-attendance`;
    
    try {
      const response = await api.put(endpoint, { 
        status: status,
        teacherId: userId
      });
      
      console.log('Teacher attendance updated successfully:', response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to update teacher attendance:', err.response?.status, err.response?.data);
      throw err;
    }
    
  } catch (error) {
    console.error('Error updating teacher attendance:', error);
    console.error('Request details:', {
      eventId,
      status,
      errorStatus: error?.response?.status,
      errorData: error?.response?.data
    });
    throw error;
  }
};
