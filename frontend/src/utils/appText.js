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
