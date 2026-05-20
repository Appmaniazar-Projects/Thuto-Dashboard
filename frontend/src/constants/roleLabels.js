/**
 * Role Display Labels
 * 
 * Maps role constants to user-friendly display names
 * This replaces generic "Super Admin" labels with explicit role names
 * 
 * @author Thuto Dashboard Team
 * @since May 20, 2026
 */

/**
 * Display names for user roles
 * Used throughout the application to show clear, understandable role labels
 */
export const ROLE_DISPLAY_NAMES = {
  'superadmin_national': 'National Admin',
  'superadmin_provincial': 'Provincial Admin',
  'superadmin_regional': 'Regional Admin',
  'admin': 'School Admin',
  'teacher': 'Teacher',
  'parent': 'Parent',
  'guardian': 'Guardian',
  'sponsor': 'Sponsor',
  'helper': 'Helper',
  'student': 'Student',
  'superadmin': 'Super Admin' // Fallback for generic superadmin
};

/**
 * Get display name for a role
 * @param {string} role - The role identifier (e.g., 'superadmin_provincial')
 * @returns {string} - The display name (e.g., 'Provincial Admin')
 * 
 * @example
 * getRoleDisplayName('superadmin_provincial') // Returns 'Provincial Admin'
 * getRoleDisplayName('admin') // Returns 'School Admin'
 */
export const getRoleDisplayName = (role) => {
  if (!role) return 'User';
  const normalizedRole = role.toLowerCase().trim();
  return ROLE_DISPLAY_NAMES[normalizedRole] || role;
};

/**
 * Role category helpers
 */
export const isSuperAdmin = (role) => {
  return [
    'superadmin',
    'superadmin_national',
    'superadmin_provincial',
    'superadmin_regional'
  ].includes(role?.toLowerCase());
};

export const isSchoolAdmin = (role) => {
  return role?.toLowerCase() === 'admin';
};

export const isTeacher = (role) => {
  return role?.toLowerCase() === 'teacher';
};

export const isParent = (role) => {
  const parentRoles = ['parent', 'guardian', 'sponsor', 'helper'];
  return parentRoles.includes(role?.toLowerCase());
};

export const isStudent = (role) => {
  return role?.toLowerCase() === 'student';
};

/**
 * Get role badge color
 * Used for visual distinction in UI
 */
export const getRoleBadgeColor = (role) => {
  const roleMap = {
    'superadmin_national': '#1976d2', // Blue - highest level
    'superadmin_provincial': '#1976d2', // Blue
    'superadmin_regional': '#1976d2', // Blue
    'admin': '#388e3c', // Green - school level
    'teacher': '#7b1fa2', // Purple
    'student': '#f57c00', // Orange
    'parent': '#c62828' // Red
  };
  
  return roleMap[role?.toLowerCase()] || '#757575'; // Gray default
};

export default {
  ROLE_DISPLAY_NAMES,
  getRoleDisplayName,
  isSuperAdmin,
  isSchoolAdmin,
  isTeacher,
  isParent,
  isStudent,
  getRoleBadgeColor
};
