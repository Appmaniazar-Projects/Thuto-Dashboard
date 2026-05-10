import api from './api';

const EVENTS_BASE = '/events';

// Helper function to get current school ID from localStorage
const getCurrentSchoolId = () => {
  const storedUser = localStorage.getItem('user');
  const storedSuperAdmin = localStorage.getItem('superAdmin');
  let schoolId = localStorage.getItem('schoolId');

  try {
    const userInfo = storedUser ? JSON.parse(storedUser) : null;
    if (userInfo?.schoolId) schoolId = userInfo.schoolId;
  } catch (e) {
    // ignore
  }

  try {
    const superAdminInfo = storedSuperAdmin ? JSON.parse(storedSuperAdmin) : null;
    if (superAdminInfo?.schoolId) schoolId = superAdminInfo.schoolId;
  } catch (e) {
    // ignore
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
    normalizedEvent.startTime = time ? time.substring(0, 8) : '00:00:00';
  }

  if (normalizedEvent.endDate && normalizedEvent.endDate.includes('T')) {
    const [date, time] = normalizedEvent.endDate.split('T');
    normalizedEvent.endDate = date;
    normalizedEvent.endTime = time ? time.substring(0, 8) : '00:00:00';
  }

  return normalizedEvent;
};

const normalizeEventPayload = (eventData) => {
  if (!eventData || typeof eventData !== 'object') return eventData;

  const payload = { ...eventData };

  // Handle date/time fields - backend expects separate LocalDate and LocalTime fields
  if (payload.startDate) {
    if (payload.startDate.includes('T')) {
      const [date, time] = payload.startDate.split('T');
      payload.startDate = date;
      payload.startTime = time ? time.substring(0, 8) : '00:00:00';
    } else {
      payload.startTime = payload.startTime || '00:00:00';
    }
  }

  if (payload.endDate) {
    if (payload.endDate.includes('T')) {
      const [date, time] = payload.endDate.split('T');
      payload.endDate = date;
      payload.endTime = time ? time.substring(0, 8) : '00:00:00';
    } else {
      payload.endTime = payload.endTime || '00:00:00';
    }
  }

  // Handle Date objects
  if (payload.startDate instanceof Date) {
    payload.startDate = payload.startDate.toISOString().split('T')[0];
    payload.startTime = payload.startDate.toISOString().split('T')[1].substring(0, 8);
  }
  if (payload.endDate instanceof Date) {
    payload.endDate = payload.endDate.toISOString().split('T')[0];
    payload.endTime = payload.endDate.toISOString().split('T')[1].substring(0, 8);
  }

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

  // Preserve userId and schoolId when explicitly provided in eventData

  return payload;
};

// Get all events for a specific date range
export const getEvents = async (startDate, endDate) => {
  try {
    const schoolId = getCurrentSchoolId();
    const response = await api.get(`${EVENTS_BASE}/${schoolId}`);
    const events = coerceEventsArray(response.data);

    const normalizedEvents = events.map(normalizeEventDates);

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
    const response = await api.put(`/events/update/${eventId}`, payload);
    
    // Normalize dates if backend returns separate LocalDate/LocalTime
    const normalizedEvent = normalizeEventDates(response.data);
    
    return normalizedEvent;
  } catch (error) {
    console.error('Error updating event:', error.response || error);
    throw error;
  }
};

export const cancelEvent = async (eventId) => {
  try {
    const schoolId = getCurrentSchoolId();
    const response = await api.put(`${EVENTS_BASE}/${eventId}/${schoolId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    await api.delete(`${EVENTS_BASE}/remove/${eventId}`);
    return eventId;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event types
export const getEventTypes = async () => {
  try {
    const response = await api.get(`${EVENTS_BASE}/event-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event types:', error);
    return [];
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
    const endpoint = `/events/${eventId}/teacher-attendance`;
    const response = await api.put(endpoint, { status });
    console.log('Teacher attendance updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating teacher attendance:', error);
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

export const submitTeacherRSVP = async (eventId, teacherId, rsvpData) => {
  try {
    const response = await api.post(
      `/rsvps/${eventId}/teachers/${teacherId}/rsvp`,
      rsvpData
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting teacher RSVP:', error);
    throw error;
  }
};

export const submitParentRSVP = async (eventId, parentId, rsvpData) => {
  try {
    const response = await api.post(
      `/rsvps/${eventId}/parents/${parentId}/rsvp`,
      rsvpData
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting parent RSVP:', error);
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
    const response = await api.patch(`/sponsorships/${sponsorshipId}`, sponsorshipData);
    return response.data;
  } catch (error) {
    console.error('Error updating sponsorship:', error);
    throw error;
  }
};

export const approveSponsorship = async (sponsorshipId) => {
  try {
    const response = await api.patch(`/sponsorships/${sponsorshipId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving sponsorship:', error);
    throw error;
  }
};

export const rejectSponsorship = async (sponsorshipId, reason = '') => {
  try {
    const response = await api.patch(`/sponsorships/${sponsorshipId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting sponsorship:', error);
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

// Volunteer Management
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
    const params = { ...filters, query };
    const response = await api.get(`${EVENTS_BASE}/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};