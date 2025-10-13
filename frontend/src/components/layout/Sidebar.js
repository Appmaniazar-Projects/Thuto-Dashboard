// // src/components/layout/Sidebar.js
// import React from 'react';
// import { Link } from 'react-router-dom';
// import {
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   Toolbar,
//   IconButton,
//   Tooltip,
//   Box,
//   Typography,
//   useMediaQuery,
//   useTheme,
// } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import EventIcon from '@mui/icons-material/Event';
// import AssignmentIcon from '@mui/icons-material/Assignment';
// import EmailIcon from '@mui/icons-material/Email';
// import PersonIcon from '@mui/icons-material/Person';
// import SettingsIcon from '@mui/icons-material/Settings';
// import PeopleIcon from '@mui/icons-material/People';
// import AssessmentIcon from '@mui/icons-material/Assessment';
// import FolderIcon from '@mui/icons-material/Folder';
// import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
// import LogoutIcon from '@mui/icons-material/Logout';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import CampaignIcon from '@mui/icons-material/Campaign';
// import SchoolIcon from '@mui/icons-material/School';
// import SubjectIcon from '@mui/icons-material/Subject';
// import SchoolLogo from '../common/SchoolLogo';

// import { useAuth } from '../../context/AuthContext';

// const Sidebar = ({ mobileOpen, setMobileOpen, sidebarWidth, sidebarWidthCollapsed }) => {
//   // DEBUG: Log user and role to verify role-based rendering
//   const { user, logout } = useAuth();
//   console.log('[Sidebar] user:', user, 'role:', user?.role);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
 
  
//   const drawerVariant = isMobile ? 'temporary' : 'permanent';
//   const drawerWidth = isMobile ? sidebarWidth : sidebarWidth;
//   const drawerOpen = isMobile ? mobileOpen : true;

//   const getMenuItems = () => {
//     if (!user || !user.role) return [];
//     const role = user.role.toLowerCase();

//     let commonItems = [
//       { path: '/dashboard', icon: <DashboardIcon />, text: 'Dashboard' },
//       {
//         path: '/calendar',
//         icon: <EventIcon />,
//         text: 'Events'
//       },
//       { path: '/messages', icon: <EmailIcon />, text: 'Messages' },
//     ];

//     // Add Announcements for admin and teacher roles
//     if (['admin', 'administrator', 'teacher'].includes(role)) {
//       commonItems.push({
//         path: '/announcements',
//         icon: <CampaignIcon />,
//         text: 'Announcements',
//       });
//     }

//     // Role-specific items
//     const roleSpecificItems = {
//       admin: [
//         { path: '/admin/users', icon: <PeopleIcon />, text: 'User Management' },
//         { path: '/admin/grades', icon: <SchoolIcon />, text: 'Grade Management' },
//         { path: '/admin/subjects', icon: <SubjectIcon />, text: 'Subject Management' },
//         { path: '/admin/reports', icon: <AssessmentIcon />, text: 'Reports' },
//         { path: '/admin/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
//         { path: '/admin/settings', icon: <SettingsIcon />, text: 'System Settings' },
//       ],
//       administrator: [
//         { path: '/admin/users', icon: <PeopleIcon />, text: 'User Management' },
//         { path: '/admin/grades', icon: <SchoolIcon />, text: 'Grade Management' },
//         { path: '/admin/subjects', icon: <SubjectIcon />, text: 'Subject Management' },
//         { path: '/admin/reports', icon: <AssessmentIcon />, text: 'Reports' },
//         { path: '/admin/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
//         { path: '/admin/settings', icon: <SettingsIcon />, text: 'System Settings' },
//       ],
//       teacher: [
//         { path: '/teacher/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
//         { path: '/teacher/resources', icon: <FolderIcon />, text: 'Resources' },
//         { path: '/teacher/upload-report', icon: <CloudUploadIcon />, text: 'Upload Report' },
//       ],
//       parent: [
//         { path: '/parent/children', icon: <PeopleIcon />, text: 'My Children' },
//         { path: '/parent/academic', icon: <AssessmentIcon />, text: 'Academic Reports' },
//         { path: '/parent/reports', icon: <AssignmentIcon />, text: 'Attendance' },
//       ],
//       student: [
//         { path: '/student/subjects', icon: <LibraryBooksIcon />, text: 'My Subjects' },
//         { path: '/student/resources', icon: <FolderIcon />, text: 'Resources' },
//         { path: '/student/attendance', icon: <AssignmentIcon />, text: 'Attendance' },
//         { path: '/student/reports', icon: <AssessmentIcon />, text: 'Academic Report' },
//       ],
//     };

//     return [
//       ...commonItems,
//       ...(role && roleSpecificItems[role] ? roleSpecificItems[role] : []),
//     ];
//   };

//   const handleLogout = () => {
//     logout();
//     window.location.href = '/login';
//   };


//   const handleDrawerToggle = () => {
//     if (isMobile) {
//       setMobileOpen(!mobileOpen);
//     } else {
//       setOpen(!open);
//     }
//   };

//   return (
//     <Drawer
//       variant={drawerVariant}
//       sx={{
//         width: drawerWidth,
//         flexShrink: 0,
//         '& .MuiDrawer-paper': {
//           width: drawerWidth,
//           backgroundColor: '#111827',
//           color: '#fff',
//           borderRight: 'none',
//           boxSizing: 'border-box',
//           transition: theme.transitions.create('width', {
//             easing: theme.transitions.easing.sharp,
//             duration: theme.transitions.duration.enteringScreen,
//           }),
//           overflowX: 'hidden',
//           boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
//         },
//       }}
//       open={drawerOpen}
//       onClose={() => setMobileOpen(false)}
//       ModalProps={{
//         keepMounted: true, // Better open performance on mobile
//       }}
//     >
//       <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//         {/* Top Bar with Collapse Toggle */}
//         <Toolbar 
//           sx={{ 
//             display: 'flex', 
//             justifyContent: 'space-between', 
//             px: 2,
//             borderBottom: '1px solid #2c2c2c',
//             minHeight: '64px !important',
//             backgroundColor: '#111827',
//             flexShrink: 0,
//           }}
//         >
//             <SchoolLogo showName={true} variant="sidebar" size={32} />
//           {isMobile && (
//           <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
//             <MenuIcon />
//           </IconButton>
//           )}
//         </Toolbar>

//         {/* Main Menu Items */}
//         <Box sx={{ overflowY: 'auto', flex: 1 }}>
//           <List>
//             {getMenuItems().map((item, index) => (
//               <Tooltip key={index} title={item.text} placement="right">
//                 <ListItem
//                   button
//                   component={Link}
//                   to={item.path}
//                   sx={{
//                     minHeight: 48,
//                     justifyContent: open ? 'initial' : 'center',
//                     px: 2.5,
//                     '&:hover': {
//                       backgroundColor: 'rgba(255, 255, 255, 0.1)',
//                     },
//                   }}
//                 >
//                   <ListItemIcon
//                     sx={{
//                       minWidth: 0,
//                       mr: open ? 2 : 'auto',
//                       justifyContent: 'center',
//                       color: '#fff',
//                     }}
//                   >
//                     {item.icon}
//                   </ListItemIcon>
//                   <ListItemText primary={item.text} />
//                 </ListItem>
//               </Tooltip>
//             ))}
//           </List>
//         </Box>

//         {/* Bottom Section */}
//         <Box sx={{ mt: 'auto' }}>
//           <Divider sx={{ borderColor: '#2c2c2c', my: 1 }} />
          
//           {/* Profile Section */}
//           <Tooltip title={'Profile'} placement="right">
//             <ListItem
//               button
//               component={Link}
//               to="/profile"
//               sx={{
//                 minHeight: 48,
//                 justifyContent: open ? 'initial' : 'center',
//                 px: 2.5,
//                 '&:hover': {
//                   backgroundColor: 'rgba(255, 255, 255, 0.1)',
//                 },
//               }}
//             >
//               <ListItemIcon sx={{ color: '#fff', mr: open }}>
//                 <PersonIcon />
//               </ListItemIcon>
//               <ListItemText primary="Profile" />
//             </ListItem>
//           </Tooltip>

//           {/* Settings */}
//           <Tooltip title={'Settings'} placement="right">
//             <ListItem
//               button
//               component={Link}
//               to="/settings"
//               sx={{
//                 minHeight: 48,
//                 justifyContent: open ? 'initial' : 'center',
//                 px: 2.5,
//                 '&:hover': {
//                   backgroundColor: 'rgba(255, 255, 255, 0.1)',
//                 },
//               }}
//             >
//               <ListItemIcon sx={{ color: '#fff', mr: open }}>
//                 <SettingsIcon />
//               </ListItemIcon>
//               <ListItemText primary="Settings" />
//             </ListItem>
//           </Tooltip>
          
//           {/* Logout */}
//           <Tooltip title={'Logout'} placement="right">
//             <ListItem
//               button
//               onClick={handleLogout}
//               sx={{
//                 minHeight: 48,
//                 justifyContent: 'initial',
//                 px: 2.5,
//                 '&:hover': {
//                   backgroundColor: 'rgba(255, 0, 0, 0.1)',
//                   '& .MuiListItemIcon-root': {
//                     color: '#ff4444',
//                   },
//                 },
//               }}
//             >
//               <ListItemIcon sx={{ color: '#fff', mr: 2 }}>
//                 <LogoutIcon />
//               </ListItemIcon>
//               <ListItemText primary="Logout" />
//             </ListItem>
//           </Tooltip>
//         </Box>
//       </Box>
//     </Drawer>
//   );
// };

// export default Sidebar;

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
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
import SchoolIcon from '@mui/icons-material/School';
import SubjectIcon from '@mui/icons-material/Subject';
import SchoolLogo from '../common/SchoolLogo';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ mobileOpen, setMobileOpen, sidebarWidth }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open] = useState(true); // currently permanent sidebar

  const drawerVariant = isMobile ? 'temporary' : 'permanent';
  const drawerWidth = sidebarWidth;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (!user || !user.role) return [];
    let role = user.role.toLowerCase();
    if (role === 'administrator') role = 'admin';

    const commonItems = [
      { path: '/dashboard', icon: <DashboardIcon />, text: 'Dashboard' },
      { path: '/calendar', icon: <EventIcon />, text: 'Events' },
      { path: '/messages', icon: <EmailIcon />, text: 'Messages' },
    ];

    if (['admin', 'teacher'].includes(role)) {
      commonItems.push({ path: '/announcements', icon: <CampaignIcon />, text: 'Announcements' });
    }

    const roleItems = {
      admin: [
        { path: '/admin/users', icon: <PeopleIcon />, text: 'User Management' },
        { path: '/admin/grades', icon: <SchoolIcon />, text: 'Grade Management' },
        { path: '/admin/subjects', icon: <SubjectIcon />, text: 'Subject Management' },
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

    return [...commonItems, ...(roleItems[role] || [])];
  };

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
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
      open={isMobile ? mobileOpen : true}
      onClose={() => setMobileOpen(false)}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: 2,
            borderBottom: '1px solid #2c2c2c',
            minHeight: '64px !important',
            backgroundColor: '#111827',
            flexShrink: 0,
          }}
        >
          <SchoolLogo showName={true} variant="sidebar" size={32} />
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          <List>
            {getMenuItems().map(item => (
              <Tooltip key={item.path} title={item.text} placement="right">
                <ListItem
                  button
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
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
                  <ListItemText primary={item.text} />
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ borderColor: '#2c2c2c', my: 1 }} />

          <Tooltip title="Profile" placement="right">
            <ListItem
              button
              component={Link}
              to="/profile"
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', mr: open ? 2 : 0 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          </Tooltip>

          <Tooltip title="Settings" placement="right">
            <ListItem
              button
              component={Link}
              to="/settings"
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', mr: open ? 2 : 0 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </Tooltip>

          <Tooltip title="Logout" placement="right">
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,0,0,0.1)',
                  '& .MuiListItemIcon-root': { color: '#ff4444' },
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff', mr: 2 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
