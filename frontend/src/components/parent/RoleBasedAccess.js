import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { 
  isParentRole, 
  isGuardianRole, 
  isSponsorRole, 
  isHelperRole,
  getParentRolePermissions 
} from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

const RoleBasedAccess = ({ 
  children, 
  requiredPermission = null, 
  fallback = null,
  showWarning = true 
}) => {
  const { user } = useAuth();
  
  // If user is not a parent role, allow access (for other roles)
  if (!isParentRole(user?.role)) {
    return <>{children}</>;
  }
  
  // Get user permissions based on role
  const userPermissions = getParentRolePermissions(user?.role);
  
  // If no specific permission required, check if user has any access
  if (!requiredPermission) {
    if (userPermissions.includes('full_access') || 
        userPermissions.includes('attendance') || 
        userPermissions.includes('reports')) {
      return <>{children}</>;
    }
    
    if (showWarning) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              Access Restricted
            </Typography>
            <Typography variant="body2">
              Your current role does not have permission to access this feature.
            </Typography>
          </Alert>
        </Box>
      );
    }
    
    return <>{fallback}</>;
  }
  
  // Check if user has the required permission
  if (userPermissions.includes(requiredPermission) || 
      userPermissions.includes('full_access')) {
    return <>{children}</>;
  }
  
  // Show fallback or warning
  if (showWarning) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body2">
            This feature requires "{requiredPermission}" permission, 
            which is not available for your current role.
          </Typography>
        </Alert>
      </Box>
    );
  }
  
  return <>{fallback}</>;
};

// Specific permission components for easier usage
export const AttendanceAccess = ({ children, fallback, showWarning }) => (
  <RoleBasedAccess 
    requiredPermission="attendance" 
    fallback={fallback}
    showWarning={showWarning}
  >
    {children}
  </RoleBasedAccess>
);

export const ReportsAccess = ({ children, fallback, showWarning }) => (
  <RoleBasedAccess 
    requiredPermission="reports" 
    fallback={fallback}
    showWarning={showWarning}
  >
    {children}
  </RoleBasedAccess>
);

export const ResourcesAccess = ({ children, fallback, showWarning }) => (
  <RoleBasedAccess 
    requiredPermission="resources" 
    fallback={fallback}
    showWarning={showWarning}
  >
    {children}
  </RoleBasedAccess>
);

export const CommunicationAccess = ({ children, fallback, showWarning }) => (
  <RoleBasedAccess 
    requiredPermission="communication" 
    fallback={fallback}
    showWarning={showWarning}
  >
    {children}
  </RoleBasedAccess>
);

export const FullAccess = ({ children, fallback, showWarning }) => (
  <RoleBasedAccess 
    requiredPermission="full_access" 
    fallback={fallback}
    showWarning={showWarning}
  >
    {children}
  </RoleBasedAccess>
);

// Helper hook to check current user permissions
export const useParentPermissions = () => {
  const { user } = useAuth();
  
  if (!isParentRole(user?.role)) {
    return {
      hasAttendanceAccess: true,
      hasReportsAccess: true,
      hasResourcesAccess: true,
      hasCommunicationAccess: true,
      hasFullAccess: true,
      isSponsor: false,
      isHelper: false,
      isGuardian: false,
      permissions: ['full_access']
    };
  }
  
  const permissions = getParentRolePermissions(user?.role);
  
  return {
    hasAttendanceAccess: permissions.includes('attendance') || permissions.includes('full_access'),
    hasReportsAccess: permissions.includes('reports') || permissions.includes('full_access'),
    hasResourcesAccess: permissions.includes('resources') || permissions.includes('full_access'),
    hasCommunicationAccess: permissions.includes('communication') || permissions.includes('full_access'),
    hasFullAccess: permissions.includes('full_access'),
    isSponsor: isSponsorRole(user?.role),
    isHelper: isHelperRole(user?.role),
    isGuardian: isGuardianRole(user?.role),
    permissions
  };
};

export default RoleBasedAccess;
