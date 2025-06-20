// src/components/layout/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open }) => {
  const { currentUser } = useAuth();
  const drawerWidth = 240;

  // Define role-specific menu items
  const getMenuItems = () => {
    const role = currentUser?.role?.toLowerCase();
    
    // Common menu items for all users
    const commonItems = [
      {
        path: '/dashboard',
        icon: <DashboardIcon />,
        text: 'Dashboard'
      },
      {
        path: '/calendar',
        icon: <CalendarTodayIcon />,
        text: 'Calendar'
      },
      {
        path: '/communication',
        icon: <EmailIcon />,
        text: 'Messages'
      }
    ];
    
    // Role-specific menu items
    const roleSpecificItems = {
      admin: [
        {
          path: '/users',
          icon: <PeopleIcon />,
          text: 'User Management'
        },
        {
          path: '/reports',
          icon: <AssessmentIcon />,
          text: 'Reports'
        },
        {
          path: '/system',
          icon: <SettingsIcon />,
          text: 'System Settings'
        }
      ],
      teacher: [
        {
          path: '/attendance',
          icon: <AssignmentIcon />,
          text: 'Attendance'
        },
        {
          path: '/assignments',
          icon: <FolderIcon />,
          text: 'Assignments'
        },
        {
          path: '/grades',
          icon: <AssessmentIcon />,
          text: 'Grading'
        },
        {
          path: '/students',
          icon: <GroupIcon />,
          text: 'Students'
        }
      ],
      parent: [
        {
          path: '/children',
          icon: <PeopleIcon />,
          text: 'My Children'
        },
        {
          path: '/academic',
          icon: <AssessmentIcon />,
          text: 'Academic Reports'
        },
        {
          path: '/attendance',
          icon: <AssignmentIcon />,
          text: 'Attendance'
        }
      ],
      student: [
        {
          path: '/assignments',
          icon: <AssignmentIcon />,
          text: 'Assignments'
        },
        {
          path: '/grades',
          icon: <AssessmentIcon />,
          text: 'Grades'
        },
        {
          path: '/courses',
          icon: <LibraryBooksIcon />,
          text: 'My Courses'
        },
        {
          path: '/resources',
          icon: <FolderIcon />,
          text: 'Resources'
        }
      ]
    };
    
    // Return common items plus role-specific items
    return [
      ...commonItems,
      ...(role && roleSpecificItems[role] ? roleSpecificItems[role] : [])
    ];
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          position: 'relative',
          whiteSpace: 'nowrap',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...(!open && {
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme => theme.spacing(7),
          }),
        },
      }}
      open={open}
    >
      <Toolbar />
      <List>
        {getMenuItems().map((item, index) => (
          <ListItem button component={Link} to={item.path} key={index}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem button component={Link} to="/profile">
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        
        <ListItem button component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;