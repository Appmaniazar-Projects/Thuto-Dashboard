// src/context/NotificationContext.js
//
// Single source of truth for in-app notifications.
//   - Fetches on login (Card 2) and when the bell / notifications page is opened (Card 5)
//   - Reuses recent data instead of re-calling GET on every open (Card 5)
//   - Marks as read / expires through the backend, then updates local state so the
//     UI changes without a page reload or an extra GET (Cards 3, 4, 5)
//   - Never changes the UI before the backend confirms, so a failed request can't
//     leave a notification looking read or removed when it isn't (Cards 3, 4)

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';
import { describeError, logError } from '../utils/describeError';
import { NOTIFICATION_CONFIG } from '../config/appConfig';

const NotificationContext = createContext(null);

export const canReceiveNotifications = (user) =>
  Boolean(user?.role) && NOTIFICATION_CONFIG.ROLES.includes(user.role.toLowerCase());

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const enabled = canReceiveNotifications(user);
  const userKey = enabled ? `${user.id ?? ''}:${user.role}` : null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false); // true only while fetching with nothing to show yet
  const [refreshing, setRefreshing] = useState(false); // background refresh with data already on screen
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const inFlight = useRef(null); // de-duplicates concurrent GETs
  const lastFetchedAt = useRef(0);
  const hasLoadedRef = useRef(false);
  const activeUserKey = useRef(userKey); // ignore responses that arrive after logout / user switch

  const setPending = (id, isPending) =>
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });

  /**
   * Fetch notifications.
   * @param {{ force?: boolean }} options force=true bypasses the staleness window (e.g. "Retry").
   */
  const fetchNotifications = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled) return;
      if (inFlight.current) return inFlight.current;
      if (!force && Date.now() - lastFetchedAt.current < NOTIFICATION_CONFIG.STALE_AFTER_MS) return;

      const requestKey = userKey;
      const firstLoad = !hasLoadedRef.current;
      firstLoad ? setLoading(true) : setRefreshing(true);
      setError(null);

      inFlight.current = (async () => {
        try {
          const list = await notificationService.getNotifications();
          if (activeUserKey.current !== requestKey) return;
          setNotifications(list);
          setHasLoaded(true);
          hasLoadedRef.current = true;
          lastFetchedAt.current = Date.now();
        } catch (err) {
          if (activeUserKey.current !== requestKey) return;
          logError('Failed to load notifications', err);
          setError(describeError(err, 'Could not load notifications.'));
        } finally {
          inFlight.current = null;
          if (activeUserKey.current === requestKey) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      })();

      return inFlight.current;
    },
    [enabled, userKey]
  );

  /** Card 3 — mark as read. UI changes only after the backend confirms. */
  const markAsRead = useCallback(
    async (id) => {
      const target = notifications.find((n) => n.id === id);
      if (!target || target.read || pendingIds.has(id)) return false;

      setPending(id, true);
      try {
        await notificationService.markAsRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        return true;
      } catch (err) {
        logError('Failed to mark notification as read', err);
        enqueueSnackbar(describeError(err, 'Could not mark the notification as read.'), { variant: 'error' });
        return false;
      } finally {
        setPending(id, false);
      }
    },
    [notifications, pendingIds, enqueueSnackbar]
  );

  /** Card 4 — expire (remove from the active list). Not a delete; backend owns retention. */
  const expireNotification = useCallback(
    async (id) => {
      if (pendingIds.has(id)) return false;

      setPending(id, true);
      try {
        await notificationService.expire(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        enqueueSnackbar('Notification removed', { variant: 'success' });
        return true;
      } catch (err) {
        logError('Failed to expire notification', err);
        enqueueSnackbar(describeError(err, 'Could not remove the notification.'), { variant: 'error' });
        return false;
      } finally {
        setPending(id, false);
      }
    },
    [pendingIds, enqueueSnackbar]
  );

  // Keep a ref to the latest fetch so effects don't re-run when its identity changes.
  const fetchRef = useRef(fetchNotifications);
  fetchRef.current = fetchNotifications;

  // Reset on login / logout / user switch, then fetch for the new user (Card 2: fetch on login).
  useEffect(() => {
    activeUserKey.current = userKey;
    inFlight.current = null;
    lastFetchedAt.current = 0;
    hasLoadedRef.current = false;
    setNotifications([]);
    setError(null);
    setHasLoaded(false);
    setLoading(false);
    setRefreshing(false);
    setPendingIds(new Set());

    if (userKey) {
      fetchRef.current({ force: true });
    }
  }, [userKey]);

  // Optional polling — disabled by default (NOTIFICATION_CONFIG.POLL_INTERVAL_MS = 0).
  useEffect(() => {
    if (!userKey || !NOTIFICATION_CONFIG.POLL_INTERVAL_MS) return undefined;
    const timer = setInterval(() => fetchRef.current({ force: true }), NOTIFICATION_CONFIG.POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [userKey]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = {
    enabled,
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    hasLoaded,
    isPending: (id) => pendingIds.has(id),
    fetchNotifications,
    refresh: () => fetchNotifications({ force: true }),
    markAsRead,
    expireNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
