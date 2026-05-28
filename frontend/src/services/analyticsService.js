import { analytics as firebaseAnalytics } from './firebase';
import api from './api';

const ANALYTICS_ENDPOINT = process.env.REACT_APP_ANALYTICS_ENDPOINT || '/analytics/track';

const trackEvent = async (eventName, payload = {}) => {
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    payload,
  };

  if (firebaseAnalytics) {
    try {
      // eslint-disable-next-line no-undef
      if (window.gtag) {
        window.gtag('event', eventName, payload);
      }
    } catch (error) {
      console.warn('Firebase analytics event failed:', error);
    }
  }

  try {
    // Placeholder implementation: send to configured endpoint if available
    await api.post(ANALYTICS_ENDPOINT, eventData);
    return true;
  } catch (error) {
    console.warn('Analytics tracking endpoint unavailable or failed:', error?.message || error);
    return false;
  }
};

const trackPageView = async (pageName, payload = {}) => {
  return trackEvent('page_view', { page: pageName, ...payload });
};

export default {
  trackEvent,
  trackPageView,
};
