import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  InsertDriveFile as TemplateIcon
} from '@mui/icons-material';
import { useSystemMessages } from '../../context/SystemMessageContext';
import { useSnackbar } from 'notistack';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const MESSAGE_TYPES = {
  ANNOUNCEMENT: 'announcement',
  ALERT: 'alert',
  NOTIFICATION: 'notification'
};

const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

const SystemMessagesPanel = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    systemMessages,
    loading,
    analytics,
    sendSystemMessage,
    createTemplate,
    refreshMessages,
    refreshAnalytics
  } = useSystemMessages();
  
  const [activeTab, setActiveTab] = useState(0);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    type: MESSAGE_TYPES.ANNOUNCEMENT,
    title: '',
    content: '',
    priority: PRIORITY_LEVELS.NORMAL,
    recipients: 'all',
    schedule: null
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: MESSAGE_TYPES.ANNOUNCEMENT,
    content: ''
  });

  const handleSendMessage = async () => {
    const success = await sendSystemMessage(newMessage);
    if (success) {
      setIsComposeOpen(false);
      setNewMessage({
        type: MESSAGE_TYPES.ANNOUNCEMENT,
        title: '',
        content: '',
        priority: PRIORITY_LEVELS.NORMAL,
        recipients: 'all',
        schedule: null
      });
    }
  };

  const handleCreateTemplate = async () => {
    const success = await createTemplate(newTemplate);
    if (success) {
      setIsTemplateOpen(false);
      setNewTemplate({
        name: '',
        type: MESSAGE_TYPES.ANNOUNCEMENT,
        content: ''
      });
    }
  };

  const handleRefresh = () => {
    refreshMessages();
    refreshAnalytics();
    enqueueSnackbar('Messages refreshed', { variant: 'info' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.URGENT:
        return 'error';
      case PRIORITY_LEVELS.HIGH:
        return 'warning';
      case PRIORITY_LEVELS.NORMAL:
        return 'primary';
      default:
        return 'default';
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case MESSAGE_TYPES.ALERT:
        return <WarningIcon color="error" />;
      case MESSAGE_TYPES.ANNOUNCEMENT:
        return <AnnouncementIcon color="primary" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          System Messages
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => setIsTemplateOpen(true)}
            sx={{ mr: 2 }}
          >
            New Template
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsComposeOpen(true)}
          >
            New Message
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Messages" />
          <Tab label="Analytics" />
          <Tab label="Templates" />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && (
            <>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              
              {loading ? (
                <LinearProgress />
              ) : (
                <List>
                  {systemMessages.map((message) => (
                    <React.Fragment key={message.id}>
                      <ListItem alignItems="flex-start">
                        <Box mr={2}>
                          {getMessageIcon(message.type)}
                        </Box>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle1" component="span">
                                {message.title}
                              </Typography>
                              <Chip
                                label={message.priority}
                                size="small"
                                color={getPriorityColor(message.priority)}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="textSecondary">
                                {message.content}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Message Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Messages Sent
                      </Typography>
                      <Typography variant="h4">
                        {analytics.totalMessages || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Read Rate
                      </Typography>
                      <Typography variant="h4">
                        {analytics.readRate ? `${Math.round(analytics.readRate * 100)}%` : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Response Rate
                      </Typography>
                      <Typography variant="h4">
                        {analytics.responseRate ? `${Math.round(analytics.responseRate * 100)}%` : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Message Templates
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsTemplateOpen(true)}
                sx={{ mb: 2 }}
              >
                New Template
              </Button>
              {/* Template list would go here */}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onClose={() => setIsComposeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New System Message</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                  label="Message Type"
                >
                  <MenuItem value={MESSAGE_TYPES.ANNOUNCEMENT}>Announcement</MenuItem>
                  <MenuItem value={MESSAGE_TYPES.ALERT}>Alert</MenuItem>
                  <MenuItem value={MESSAGE_TYPES.NOTIFICATION}>Notification</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={newMessage.title}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value={PRIORITY_LEVELS.LOW}>Low</MenuItem>
                  <MenuItem value={PRIORITY_LEVELS.NORMAL}>Normal</MenuItem>
                  <MenuItem value={PRIORITY_LEVELS.HIGH}>High</MenuItem>
                  <MenuItem value={PRIORITY_LEVELS.URGENT}>Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Recipients</InputLabel>
                <Select
                  value={newMessage.recipients}
                  onChange={(e) => setNewMessage({ ...newMessage, recipients: e.target.value })}
                  label="Recipients"
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="teachers">Teachers Only</MenuItem>
                  <MenuItem value="students">Students Only</MenuItem>
                  <MenuItem value="parents">Parents Only</MenuItem>
                  <MenuItem value="specific">Specific Users/Groups</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsComposeOpen(false)}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained" color="primary">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Template Dialog */}
      <Dialog open={isTemplateOpen} onClose={() => setIsTemplateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Template Type</InputLabel>
            <Select
              value={newTemplate.type}
              onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
              label="Template Type"
            >
              <MenuItem value={MESSAGE_TYPES.ANNOUNCEMENT}>Announcement</MenuItem>
              <MenuItem value={MESSAGE_TYPES.ALERT}>Alert</MenuItem>
              <MenuItem value={MESSAGE_TYPES.NOTIFICATION}>Notification</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Template Content"
            value={newTemplate.content}
            onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
            multiline
            rows={6}
            margin="normal"
            placeholder="Use {{name}} for dynamic fields"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTemplateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTemplate} variant="contained" color="primary">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemMessagesPanel;
