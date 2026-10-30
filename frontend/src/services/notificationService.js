// src/services/notificationService.js
//
// Talks to the backend Notification API. Components should NOT call these
// directly — use the NotificationContext (useNotifications) so every part of
// the UI (bell, dropdown, notifications page) shares one list and one fetch.
//
// Agreed contract (see Thuto Onboarding §8):
//   GET  /api/notifications/       -> the authenticated user's NON-expired notifications
//   PUT  /api/notifications/{id}   -> update read_status and/or expired_status
//
// The user is identified from the JWT that services/api.js attaches, so no
// userId / schoolId is sent from the frontend.

import api from './api';

/**
 * The backend contract uses snake_case (read_status, expired_status, created_at),
 * but Spring Boot serialises camelCase by default. Normalise both shapes into
 * one frontend shape so components never need to care.
 */
export const normalizeNotification = (raw = {}) => {
  const pick = (...keys) => keys.map((k) => raw[k]).find((v) => v !== undefined && v !== null);

  return {
    id: pick('id', 'notificationId'),
    subject: pick('subject', 'title') || 'Notification',
    content: pick('content', 'message', 'body') || '',
    read: Boolean(pick('read_status', 'readStatus', 'read')),
    expired: Boolean(pick('expired_status', 'expiredStatus', 'expired')),
    createdAt: pick('created_at', 'createdAt', 'timestamp') || null,
    creator: pick('creator', 'createdBy') || null,
    role: pick('role') || null,
    schoolId: pick('school_id', 'schoolId') || null,
  };
};

/** Newest first; notifications without a date go to the bottom. */
const byNewest = (a, b) => {
  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return tb - ta;
};

/** Accepts a plain array or a wrapped response ({ data: [...] }, { notifications: [...] }, { content: [...] }). */
const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content; // Spring Page<>
  return [];
};

/**
 * Build the PUT body. The agreed contract uses snake_case; the camelCase twin is
 * sent too so the request works whichever naming the Spring DTO ends up using
 * (Spring Boot ignores unknown JSON fields by default). Once the backend DTO is
 * confirmed, the unused key can be removed here — nowhere else needs to change.
 */
const toUpdatePayload = ({ read, expired }) => {
  const body = {};
  if (read !== undefined) {
    body.read_status = read;
    body.readStatus = read;
  }
  if (expired !== undefined) {
    body.expired_status = expired;
    body.expiredStatus = expired;
  }
  return body;
};

const notificationService = {
  /** GET /api/notifications/ — returns normalised, non-expired notifications, newest first. */
  async getNotifications() {
    const response = await api.get('/notifications/');
    return extractList(response.data)
      .map(normalizeNotification)
      .filter((n) => n.id !== undefined && !n.expired) // backend should already exclude expired; defensive
      .sort(byNewest);
  },

  /** PUT /api/notifications/{id} with any of { read, expired }. */
  async updateNotification(id, changes) {
    const response = await api.put(`/notifications/${id}`, toUpdatePayload(changes));
    return response.data ? normalizeNotification(response.data) : null;
  },

  /** Card 3 — persist read_status: true */
  markAsRead(id) {
    return this.updateNotification(id, { read: true });
  },

  /** Card 4 — persist expired_status: true (NOT a delete; backend handles retention) */
  expire(id) {
    return this.updateNotification(id, { expired: true });
  },
};

export { notificationService };
export default notificationService;
