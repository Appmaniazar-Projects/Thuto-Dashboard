import api from './api';

const API_BASE = '/calendar';

const coerceEventsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.events)) return data.events;
  return [];
};

const normalizeEventPayload = (eventData) => {
  if (!eventData || typeof eventData !== 'object') return eventData;

  const payload = { ...eventData };

  if (payload.startDate instanceof Date) payload.startDate = payload.startDate.toISOString();
  if (payload.endDate instanceof Date) payload.endDate = payload.endDate.toISOString();
  if (typeof payload.startDate === 'string' && payload.startDate) {
    payload.startDate = new Date(payload.startDate).toISOString();
  }
  if (typeof payload.endDate === 'string' && payload.endDate) {
    payload.endDate = new Date(payload.endDate).toISOString();
  }

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
    const response = await api.get(API_BASE, {
      params: { startDate, endDate }
    });
    return coerceEventsArray(response.data);
  } catch (error) {
    throw error;
  }
};

// Get a single event (with roles/signups/attendance if backend supports it)
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`${API_BASE}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const response = await api.post(API_BASE, normalizeEventPayload(eventData));
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`${API_BASE}/${eventId}`, normalizeEventPayload(eventData));
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    await api.delete(`${API_BASE}/${eventId}`);
    return eventId; // Return the deleted event ID for state updates
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event types (if they're dynamic)
export const getEventTypes = async () => {
  try {
    const response = await api.get(`${API_BASE}/event-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    return []; // Return default event types if API fails
  }
};

// Parent sign up for a role slot
export const signUpForEventRole = async (eventId, roleId) => {
  try {
    const response = await api.post(`${API_BASE}/${eventId}/roles/${roleId}/signup`);
    return response.data;
  } catch (error) {
    console.error('Error signing up for event role:', error);
    throw error;
  }
};

export const cancelEventSignup = async (eventId) => {
  try {
    const response = await api.post(`${API_BASE}/${eventId}/signup/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling event signup:', error);
    throw error;
  }
};

// Teacher attendance status
export const setTeacherAttendanceStatus = async (eventId, status) => {
  try {
    const response = await api.put(`${API_BASE}/${eventId}/teacher-attendance`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating teacher attendance:', error);
    throw error;
  }
};
