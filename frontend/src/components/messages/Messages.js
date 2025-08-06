import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Badge,
  Chip,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  useTheme,
  useMediaQuery,
  Collapse,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Message as MessageIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as ReadIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Mail as MailIcon,
  Group as GroupIcon,
  Campaign as CampaignIcon,
  Announcement as AnnouncementIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  MoreVert as MoreVertIcon,
  LabelImportant as LabelImportantIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';
import api from '../../services/api';
import MessageComposer from './MessageComposer';
import { APP_TEXT } from '../../utils/appText';

const roleApiMap = {
  admin: '/admin/messages',
  teacher: '/teacher/messages',
  parent: '/parent/messages',
  student: '/student/messages',
};

const Messages = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    readStatus: 'all',
    priority: 'all'
  });

  // Message types
  const MESSAGE_TYPES = {
    DIRECT: 'direct',
    GROUP: 'group',
    ANNOUNCEMENT: 'announcement',
    SYSTEM: 'system'
  };

  // Mock data for development
  const mockMessages = [
    {
      id: 1,
      subject: APP_TEXT.WELCOME_EMAIL.subject,
      message: APP_TEXT.WELCOME_EMAIL.message,
      sender: { name: 'System', id: 'system', role: 'system' },
      recipients: [],
      type: MESSAGE_TYPES.SYSTEM,
      date: new Date().toISOString(),
      read: false,
      priority: 'high',
      metadata: { isPinned: true }
    },
    {
      id: 2,
      subject: 'Your account has been verified',
      message: 'Your email address has been successfully verified. You now have full access to all features.',
      sender: { name: 'Admin', id: 'admin1', role: 'admin' },
      recipients: [
        { name: 'Current User', id: 'current-user', role: 'teacher' }
      ],
      type: MESSAGE_TYPES.DIRECT,
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      read: true,
      priority: 'normal'
    },
    {
      id: 3,
      subject: 'New assignment posted',
      message: 'A new assignment has been posted in Mathematics. The deadline is next Monday.',
      sender: { name: 'John Smith', id: 'teacher1', role: 'teacher' },
      recipients: [
        { name: 'Grade 10A Mathematics', id: 'class1', type: 'class' },
        { name: 'Grade 10B Mathematics', id: 'class2', type: 'class' }
      ],
      type: MESSAGE_TYPES.GROUP,
      date: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      priority: 'high',
      metadata: { subject: 'Mathematics', grade: '10' }
    },
    {
      id: 4,
      subject: 'Parent-Teacher meeting',
      message: 'This is a reminder about the parent-teacher meeting scheduled for tomorrow at 2 PM.',
      sender: { name: 'Sarah Johnson', id: 'teacher2', role: 'teacher' },
      recipients: [
        { name: 'All Parents', id: 'all-parents', type: 'group' }
      ],
      type: MESSAGE_TYPES.GROUP,
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      read: true,
      priority: 'normal'
    },
    {
      id: 5,
      subject: 'School holiday notice',
      message: 'Please be informed that the school will be closed next week for the mid-term break.',
      sender: { name: 'Dr. Wilson', id: 'principal1', role: 'admin' },
      recipients: [
        { name: 'All Staff', id: 'all-staff', type: 'group' },
        { name: 'All Students', id: 'all-students', type: 'group' },
        { name: 'All Parents', id: 'all-parents', type: 'group' }
      ],
      type: MESSAGE_TYPES.ANNOUNCEMENT,
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      read: true,
      priority: 'high',
      metadata: { isPinned: true }
    }
  ];

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      setMessages(mockMessages);
      setFilteredMessages(mockMessages);
      setLoading(false);
      setRefreshing(false);
    }, 800); // Simulate network delay

    return () => clearTimeout(timer);
  }, [refreshing]);

  // Filters and sorting state moved to the top with other state declarations

  // Apply filters and sorting
  useEffect(() => {
    let result = [...messages];
    
    // Apply search
    if (filters.searchTerm.trim() !== '') {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(msg => {
        const senderName = msg.sender?.name?.toLowerCase() || '';
        const subject = msg.subject?.toLowerCase() || '';
        const message = msg.message?.toLowerCase() || '';
        
        return (
          subject.includes(searchTerm) ||
          message.includes(searchTerm) ||
          senderName.includes(searchTerm)
        );
      });
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(msg => msg.type === filters.type);
    }
    
    // Apply read status filter
    if (filters.readStatus === 'read') {
      result = result.filter(msg => msg.read);
    } else if (filters.readStatus === 'unread') {
      result = result.filter(msg => !msg.read);
    }
    
    // Apply priority filter
    if (filters.priority !== 'all') {
      result = result.filter(msg => msg.priority === filters.priority);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (sortBy === 'newest') {
        return dateB - dateA; // Newest first
      } else if (sortBy === 'oldest') {
        return dateA - dateB; // Oldest first
      } else if (sortBy === 'unread') {
        // Unread first, then by newest
        if (a.read === b.read) return dateB - dateA;
        return a.read ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredMessages(result);
  }, [messages, filters, sortBy]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const getMessageTypeLabel = (type) => {
    switch(type) {
      case MESSAGE_TYPES.DIRECT: return 'Direct';
      case MESSAGE_TYPES.GROUP: return 'Group';
      case MESSAGE_TYPES.ANNOUNCEMENT: return 'Announcement';
      case MESSAGE_TYPES.SYSTEM: return 'System';
      default: return type;
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return 'High';
      case 'normal': return 'Normal';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      // Implement your API call to mark message as read
      // await api.patch(`/messages/${messageId}`, { read: true });
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        // Implement your API call to delete message
        // await api.delete(`/messages/${messageId}`);
        setMessages(messages.filter(msg => msg.id !== messageId));
      } catch (err) {
        console.error('Error deleting message:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTitle = (msg) => msg.subject || msg.title || 'No Subject';
  const getBody = (msg) => msg.message || msg.body || 'No content';
  const getSender = (msg) => msg.sender || 'System';
  const isUnread = (msg) => !msg.read;

  const handleNewMessage = () => {
    setComposerOpen(true);
  };

  const handleMessageSent = (newMessage) => {
    // Add the new message to the top of the list
    setMessages(prev => [newMessage, ...prev]);
    enqueueSnackbar('Message sent successfully', { variant: 'success' });
  };

  // State for UI controls
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const { enqueueSnackbar } = useSnackbar();
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!filteredMessages.length) {
    return (
      <Box textAlign="center" mt={4}>
        <MessageIcon color="disabled" style={{ fontSize: 60 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {filters.searchTerm ? 'No matching messages found' : 'No messages yet'}
        </Typography>
        {filters.searchTerm ? (
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search or clear the search to see all messages
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
            You'll see your messages here when you receive any
          </Typography>
        )}
        <Box mt={2}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<MessageIcon />}
            onClick={handleNewMessage}
          >
            New Message
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          <MailIcon sx={{ verticalAlign: 'middle', mr: 1, mb: 0.5 }} />
          Messages
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<MessageIcon />}
          onClick={handleNewMessage}
        >
          New Message
        </Button>
      </Box>

      {/* Message Composer Dialog */}
      <MessageComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSend={handleMessageSent}
      />

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search messages..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="message-type-label">Message Type</InputLabel>
                  <Select
                    labelId="message-type-label"
                    value={filters.type}
                    label="Message Type"
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value={MESSAGE_TYPES.DIRECT}>Direct</MenuItem>
                    <MenuItem value={MESSAGE_TYPES.GROUP}>Group</MenuItem>
                    <MenuItem value={MESSAGE_TYPES.ANNOUNCEMENT}>Announcement</MenuItem>
                    <MenuItem value={MESSAGE_TYPES.SYSTEM}>System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="read-status-label">Read Status</InputLabel>
                  <Select
                    labelId="read-status-label"
                    value={filters.readStatus}
                    label="Read Status"
                    onChange={(e) => handleFilterChange('readStatus', e.target.value)}
                  >
                    <MenuItem value="all">All Messages</MenuItem>
                    <MenuItem value="unread">Unread Only</MenuItem>
                    <MenuItem value="read">Read Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    value={filters.priority}
                    label="Priority"
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>

      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        <List disablePadding>
          {filteredMessages.map((msg, idx) => (
            <React.Fragment key={msg.id || idx}>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  bgcolor: isUnread(msg) ? 'action.hover' : 'background.paper',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: isUnread(msg) ? 'action.selected' : 'action.hover',
                  },
                  borderLeft: isUnread(msg) 
                    ? `4px solid ${theme.palette.primary.main}` 
                    : msg.priority === 'high' 
                      ? `4px solid ${theme.palette.error.main}`
                      : 'none',
                  pl: isUnread(msg) || msg.priority === 'high' ? '12px' : '16px',
                  position: 'relative',
                  pr: 8,
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={isUnread(msg) ? 'Mark as read' : 'Mark as unread'}>
                      <IconButton 
                        edge="end" 
                        size="small" 
                        onClick={() => handleMarkAsRead(msg.id)}
                        sx={{ mr: 0.5 }}
                      >
                        {isUnread(msg) ? (
                          <ReadIcon fontSize="small" color="action" />
                        ) : (
                          <MailIcon fontSize="small" color="action" />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="More actions">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle more actions
                        }}
                        sx={{ mr: 0.5 }}
                      >
                        <MoreVertIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                    
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(msg.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Badge
                    color="primary"
                    variant="dot"
                    invisible={!isUnread(msg)}
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: msg.type === MESSAGE_TYPES.SYSTEM ? 'secondary.main' : 
                              msg.type === MESSAGE_TYPES.ANNOUNCEMENT ? 'warning.main' :
                              msg.type === MESSAGE_TYPES.GROUP ? 'info.main' :
                              isUnread(msg) ? 'primary.main' : 'grey.400',
                        width: 40, 
                        height: 40,
                      }}
                    >
                      {msg.type === MESSAGE_TYPES.SYSTEM ? (
                        <AnnouncementIcon fontSize="small" />
                      ) : msg.type === MESSAGE_TYPES.ANNOUNCEMENT ? (
                        <CampaignIcon fontSize="small" />
                      ) : msg.type === MESSAGE_TYPES.GROUP ? (
                        <GroupIcon fontSize="small" />
                      ) : (
                        <MailIcon fontSize="small" />
                      )}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={isUnread(msg) ? 600 : 400}
                        sx={{ 
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {msg.priority === 'high' && (
                          <LabelImportantIcon color="error" fontSize="small" />
                        )}
                        {msg.metadata?.isPinned && (
                          <StarIcon color="warning" fontSize="small" />
                        )}
                        {getTitle(msg)}
                      </Typography>
                      
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip 
                          label={msg.sender?.name || 'Unknown'}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.7rem',
                            bgcolor: 'background.paper',
                            borderColor: 'divider'
                          }}
                        />
                        
                        {msg.type !== MESSAGE_TYPES.DIRECT && (
                          <Chip 
                            label={getMessageTypeLabel(msg.type)}
                            size="small"
                            variant="outlined"
                            color={msg.type === MESSAGE_TYPES.ANNOUNCEMENT ? 'warning' : 
                                  msg.type === MESSAGE_TYPES.GROUP ? 'info' : 'default'}
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              bgcolor: 'background.paper',
                              borderColor: 'divider'
                            }}
                          />
                        )}
                        
                        {msg.priority && msg.priority !== 'normal' && (
                          <Chip 
                            label={getPriorityLabel(msg.priority)}
                            size="small"
                            variant="outlined"
                            color={msg.priority === 'high' ? 'error' : 'default'}
                            icon={msg.priority === 'high' ? 
                              <PriorityHighIcon fontSize="small" /> : 
                              <LowPriorityIcon fontSize="small" />}
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              bgcolor: 'background.paper',
                              borderColor: 'divider'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mt: 0.5,
                          lineHeight: 1.3
                        }}
                      >
                        {getBody(msg)}
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {formatDate(msg.date || msg.time)}
                          
                          {msg.recipients && msg.recipients.length > 0 && (
                            <>
                              <span>•</span>
                              <Tooltip 
                                title={msg.recipients.map(r => r.name).join(', ')}
                                placement="top"
                              >
                                <span>
                                  {msg.recipients.length} 
                                  {msg.recipients.length === 1 ? 'recipient' : 'recipients'}
                                </span>
                              </Tooltip>
                            </>
                          )}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {msg.metadata?.subject && (
                            <Chip 
                              label={msg.metadata.subject}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.6rem',
                                bgcolor: 'background.paper',
                                borderColor: 'divider'
                              }}
                            />
                          )}
                          
                          {msg.metadata?.grade && (
                            <Chip 
                              label={`Grade ${msg.metadata.grade}`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.6rem',
                                bgcolor: 'background.paper',
                                borderColor: 'divider'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    </>
                  }
                  primaryTypographyProps={{
                    sx: { 
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 0.5 
                    }
                  }}
                />
              </ListItem>
              {idx < filteredMessages.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      {renderMenu}
      {renderMobileMenu}
    </Box>
  );
};

export default Messages;
