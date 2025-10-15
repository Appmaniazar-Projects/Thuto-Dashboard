import { APP_CONFIG } from '../config/appConfig';

export const APP_TEXT = {
  SITE_NAME: process.env.REACT_APP_SITE_NAME || APP_CONFIG.SITE_NAME,
  DASHBOARD_TITLE: `${process.env.REACT_APP_SITE_NAME || APP_CONFIG.SITE_NAME} Dashboard`,
  WELCOME_MESSAGE: `Welcome to ${process.env.REACT_APP_SITE_NAME || APP_CONFIG.SITE_NAME} Portal`,
  WELCOME_EMAIL: {
    subject: `Welcome to ${process.env.REACT_APP_SITE_NAME || APP_CONFIG.SITE_NAME} Dashboard`,
    message: `Thank you for joining ${process.env.REACT_APP_SITE_NAME || APP_CONFIG.SITE_NAME}. We are excited to have you on board!`,
  },
};

/**
 * Utility functions for handling default values for empty/null data
 */

/**
 * Get default value for numbers
 * @param {*} value - The value to check
 * @param {number} defaultValue - Default value to return (default: 0)
 * @returns {number} The value or default
 */
export const getDefaultNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '' || isNaN(value)) {
    return defaultValue;
  }
  return Number(value);
};

/**
 * Get default value for strings
 * @param {*} value - The value to check
 * @param {string} defaultValue - Default value to return (default: 'User')
 * @returns {string} The value or default
 */
export const getDefaultString = (value, defaultValue = 'User') => {
  if (value === null || value === undefined || value === '' || typeof value !== 'string') {
    return defaultValue;
  }
  return value.trim() || defaultValue;
};

/**
 * Get default value for error messages
 * @param {*} value - The value to check
 * @param {string} defaultValue - Default value to return (default: 'Error loading data')
 * @returns {string} The value or default error message
 */
export const getDefaultError = (value, defaultValue = 'Error loading data') => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  return String(value);
};

/**
 * Get user display name with fallbacks
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  
  const name = user.name || user.firstName;
  const lastName = user.lastName || user.surname;
  const email = user.email;
  
  if (name && lastName) {
    return `${name} ${lastName}`;
  }
  if (name) {
    return name;
  }
  if (email) {
    return email.split('@')[0]; // Use email username part
  }
  
  return 'User';
};

/**
 * Format percentage with fallback
 * @param {*} value - The value to format
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value) => {
  const num = getDefaultNumber(value, 0);
  return `${num}%`;
};
