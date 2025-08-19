// src/components/layout/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  IconButton,
  Tooltip,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FolderIcon from '@mui/icons-material/Folder';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CampaignIcon from '@mui/icons-material/Campaign';

import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, setOpen, mobileOpen, setMobileOpen, title, sidebarWidth, sidebarWidthCollapsed }) => {
  // DEBUG: Log user and role to verify role-based rendering
  const { user, logout } = useAuth();
  console.log('[Sidebar] user:', user, 'role:', user?.role);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
 
  
  const drawerVariant = isMobile ? 'temporary' : 'permanent';
  const drawerWidth = isMobile ? sidebarWidth : (open ? sidebarWidth : sidebarWidthCollapsed);
  const drawerOpen = isMobile ? mobileOpen : true;

  const getMenuItems = () => {
    if (!user || !user.role) return [];
    const role = user.role.toLowerCase();

    let commonItems = [
      { path: '/dashboard', icon: <DashboardIcon />, text: 'Dashboard' },
      { path: '/calendar', icon: <CalendarTodayIcon />, text: 'Calendar' },
      { path: '/messages', icon: <EmailIcon />, text: 'Messages' },
      { path: '/announcements', icon: <CampaignIcon />, text: 'Announcements' },
    ];

    // Remove Calendar for students as per user request
    if (role === 'student') {
      commonItems = commonItems.filter(item => item.path !== '/calendar');
    }

    const roleSpecificItems = {
      admin: [
        { path: '/admin/users', icon: <PeopleIcon />, text: 'User Management' },
        { path: '/admin/reports', icon: <AssessmentIcon />, text: 'Reports' },
        { path: '/admin/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
        { path: '/admin/settings', icon: <SettingsIcon />, text: 'System Settings' },
      ],
      administrator: [
        { path: '/admin/users', icon: <PeopleIcon />, text: 'User Management' },
        { path: '/admin/reports', icon: <AssessmentIcon />, text: 'Reports' },
        { path: '/admin/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
        { path: '/admin/settings', icon: <SettingsIcon />, text: 'System Settings' },
      ],
      teacher: [
        { path: '/teacher/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
        { path: '/teacher/resources', icon: <FolderIcon />, text: 'Resources' },
        { path: '/teacher/upload-report', icon: <CloudUploadIcon />, text: 'Upload Report' },
      ],
      parent: [
        { path: '/parent/children', icon: <PeopleIcon />, text: 'My Children' },
        { path: '/parent/academic', icon: <AssessmentIcon />, text: 'Academic Reports' },
        { path: '/parent/reports', icon: <AssignmentIcon />, text: 'Attendance' },
      ],
      student: [
        { path: '/student/subjects', icon: <LibraryBooksIcon />, text: 'My Subjects' },
        { path: '/student/resources', icon: <FolderIcon />, text: 'Resources' },
        { path: '/student/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
        { path: '/student/reports', icon: <AssessmentIcon />, text: 'Academic Report' },
      ],
    };

    return [
      ...commonItems,
      ...(role && roleSpecificItems[role] ? roleSpecificItems[role] : []),
    ];
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };


  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  return (
    <Drawer
      variant={drawerVariant}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          backgroundColor: '#111827',
          color: '#fff',
          borderRight: 'none',
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        },
      }}
      open={drawerOpen}
      onClose={() => setMobileOpen(false)}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Bar with Collapse Toggle */}
        <Toolbar 
          sx={{ 
            display: 'flex', 
            justifyContent: open ? 'space-between' : 'center', 
            px: 2,
            borderBottom: '1px solid #2c2c2c',
            minHeight: '64px !important',
            backgroundColor: '#111827',
            flexShrink: 0,
          }}
        >
          {open && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                flexGrow: 1,
                textAlign: 'left',
                ml: 1,
              }}
            >
              Thuto Dashboard
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>

        {/* Main Menu Items */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <List>
            {getMenuItems().map((item, index) => (
              <Tooltip key={index} title={!open ? item.text : ''} placement="right">
                <ListItem
                  button
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} />}
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>

        {/* Bottom Section */}
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ borderColor: '#2c2c2c', my: 1 }} />
          
          {/* Profile Section */}
          <Tooltip title={!open ? 'Profile' : ''} placement="right">
            <ListItem
              button
              component={Link}
              to="/profile"
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', mr: open ? 2 : 'auto' }}>
                <PersonIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Profile" />}
            </ListItem>
          </Tooltip>

          {/* Settings */}
          <Tooltip title={!open ? 'Settings' : ''} placement="right">
            <ListItem
              button
              component={Link}
              to="/settings"
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', mr: open ? 2 : 'auto' }}>
                <SettingsIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Settings" />}
            </ListItem>
          </Tooltip>
          
          {/* Logout */}
          <Tooltip title={!open ? 'Logout' : ''} placement="right">
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  '& .MuiListItemIcon-root': {
                    color: '#ff4444',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', mr: open ? 2 : 'auto' }}>
                <LogoutIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Logout" />}
            </ListItem>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;