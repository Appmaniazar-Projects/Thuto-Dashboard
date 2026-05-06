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
  
  const normalizedEvent = { ...event };
  
  // If backend returns separate LocalDate and LocalTime fields, combine them
  if (event.startDate && event.startTime && !event.startDate.includes('T')) {
    normalizedEvent.startDate = `${event.startDate}T${event.startTime}`;
    normalizedEvent.endDate = `${event.endDate}T${event.endTime}`;
  }
  
  // If backend returns combined ISO datetime, split into separate date and time for frontend forms
  if (normalizedEvent.startDate && normalizedEvent.startDate.includes('T')) {
    const [date, time] = normalizedEvent.startDate.split('T');
    normalizedEvent.startDate = date;
    normalizedEvent.startTime = time ? time.substring(0, 8) : '00:00:00'; // HH:MM:SS format
  }
  
  if (normalizedEvent.endDate && normalizedEvent.endDate.includes('T')) {
    const [date, time] = normalizedEvent.endDate.split('T');
    normalizedEvent.endDate = date;
    normalizedEvent.endTime = time ? time.substring(0, 8) : '00:00:00'; // HH:MM:SS format
  }
  
  return normalizedEvent;
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

  // Handle separate date and time fields by combining them
  // This is needed for both create and update operations
  if (payload.startDate && payload.startTime) {
    // Combine date and time into ISO format
    payload.startDate = `${payload.startDate}T${payload.startTime}`;
    delete payload.startTime; // Remove separate time field to avoid confusion
  }
  
  if (payload.endDate && payload.endTime) {
    // Combine date and time into ISO format
    payload.endDate = `${payload.endDate}T${payload.endTime}`;
    delete payload.endTime; // Remove separate time field to avoid confusion
  }

  if (payload.startDate instanceof Date) payload.startDate = payload.startDate.toISOString();
  if (payload.endDate instanceof Date) payload.endDate = payload.endDate.toISOString();
  if (typeof payload.startDate === 'string') payload.startDate = normalizeDateString(payload.startDate);
  if (typeof payload.endDate === 'string') payload.endDate = normalizeDateString(payload.endDate);

  // Handle new event fields
  if (payload.organizer !== undefined) {
    payload.organizer = (payload.organizer ?? '').toString().trim();
  }

  if (payload.sponsorshipEnabled !== undefined) {
    payload.sponsorshipEnabled = Boolean(payload.sponsorshipEnabled);
  }

  if (payload.maxAttendees !== undefined) {
    payload.maxAttendees = Number.isFinite(Number(payload.maxAttendees)) ? Number(payload.maxAttendees) : null;
  }

  if (payload.notificationSchedule !== undefined) {
    if (payload.notificationSchedule && typeof payload.notificationSchedule === 'object') {
      payload.notificationSchedule = JSON.stringify(payload.notificationSchedule);
    } else {
      payload.notificationSchedule = null;
    }
  }

  if (payload.recurringPattern !== undefined) {
    if (payload.recurringPattern && typeof payload.recurringPattern === 'object') {
      payload.recurringPattern = JSON.stringify(payload.recurringPattern);
    } else {
      payload.recurringPattern = null;
    }
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

// RSVP Management
export const submitRSVP = async (eventId, rsvpData) => {
  try {
    const response = await api.post(`/rsvps/${eventId}/rsvps`, rsvpData);
    return response.data;
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    throw error;
  }
};

export const getEventRSVPs = async (eventId, responseFilter = null) => {
  try {
    const params = responseFilter ? { responseFilter } : undefined;
    const response = await api.get(`/rsvps/${eventId}/rsvps`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    throw error;
  }
};

export const updateRSVP = async (rsvpId, rsvpData) => {
  try {
    const response = await api.put(`/rsvps/${rsvpId}`, rsvpData);
    return response.data;
  } catch (error) {
    console.error('Error updating RSVP:', error);
    throw error;
  }
};

export const getAdminRSVPList = async (eventId) => {
  try {
    const response = await api.get(`/admin/rsvps/${eventId}/rsvps`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin RSVP list:', error);
    throw error;
  }
};

export const sendRSVPReminders = async (eventId, message) => {
  try {
    const response = await api.post(`/admin/rsvps/${eventId}/rsvps/remind`, { message });
    return response.data;
  } catch (error) {
    console.error('Error sending RSVP reminders:', error);
    throw error;
  }
};

// Sponsorship Management
export const createSponsorship = async (eventId, sponsorshipData) => {
  try {
    const response = await api.post(`/sponsorships/${eventId}/sponsorships`, sponsorshipData);
    return response.data;
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    throw error;
  }
};

export const getEventSponsorships = async (eventId, statusFilter = null) => {
  try {
    const params = statusFilter ? { statusFilter } : undefined;
    const response = await api.get(`/sponsorships/${eventId}/sponsorships`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    throw error;
  }
};

export const updateSponsorship = async (sponsorshipId, sponsorshipData) => {
  try {
    const response = await api.put(`/sponsorships/${sponsorshipId}`, sponsorshipData);
    return response.data;
  } catch (error) {
    console.error('Error updating sponsorship:', error);
    throw error;
  }
};

export const cancelSponsorship = async (sponsorshipId) => {
  try {
    const response = await api.delete(`/sponsorships/${sponsorshipId}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling sponsorship:', error);
    throw error;
  }
};

export const getAdminSponsorshipList = async (eventId) => {
  try {
    const response = await api.get(`/admin/sponsorships/${eventId}/sponsorships`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin sponsorship list:', error);
    throw error;
  }
};

// Enhanced Volunteer Management
export const getVolunteerRoles = async (eventId) => {
  try {
    const response = await api.get(`${EVENTS_BASE}/${eventId}/volunteer-roles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching volunteer roles:', error);
    throw error;
  }
};

export const signUpForVolunteerRole = async (eventId, roleId, signupData) => {
  try {
    const response = await api.post(`${EVENTS_BASE}/${eventId}/volunteer-roles/${roleId}/signup`, signupData);
    return response.data;
  } catch (error) {
    console.error('Error signing up for volunteer role:', error);
    throw error;
  }
};

export const getAdminVolunteerList = async (eventId) => {
  try {
    const response = await api.get(`/admin/events/${eventId}/volunteers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin volunteer list:', error);
    throw error;
  }
};

// Enhanced Event Details
export const getEventDetails = async (eventId) => {
  try {
    const response = await api.get(`${EVENTS_BASE}/${eventId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

// Event Export
export const exportEvent = async (eventId, format = 'ics') => {
  try {
    const response = await api.get(`${EVENTS_BASE}/export/${eventId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting event:', error);
    throw error;
  }
};

// Event Search
export const searchEvents = async (query, filters = {}) => {
  try {
    const schoolId = getCurrentSchoolId();
    const params = { ...filters, query, schoolId };
    const response = await api.get(`${EVENTS_BASE}/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};
