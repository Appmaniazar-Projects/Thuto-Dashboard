import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  TextField,
  Button,
  Tooltip,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  useTheme,
  Collapse
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Report as ReportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

const MessageThread = ({ message, onClose, onReply, onForward, onUpdateMessage }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [replyContent, setReplyContent] = useState('');
  const [replyMode, setReplyMode] = useState(null); // 'reply', 'replyAll', 'forward'
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [thread, setThread] = useState(message);

  useEffect(() => {
    // In a real app, this would fetch the full thread from the API
    if (message.threadId) {
      // Simulate fetching thread
      const mockThread = {
        ...message,
        replies: [
          {
            id: 'reply1',
            content: 'Thanks for the update!',
            sender: { name: 'John Smith', email: 'john@example.com' },
            date: new Date(Date.now() - 3600000 * 2).toISOString(),
            read: true
          },
          {
            id: 'reply2',
            content: 'I have a question about this.',
            sender: { name: 'Jane Doe', email: 'jane@example.com' },
            date: new Date(Date.now() - 3600000).toISOString(),
            read: true
          }
        ]
      };
      setThread(mockThread);
    }
  }, [message]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReply = (type = 'reply') => {
    setReplyMode(type);
    setAnchorEl(null);
  };

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      enqueueSnackbar('Please enter a message', { variant: 'error' });
      return;
    }

    const newReply = {
      id: `reply-${Date.now()}`,
      content: replyContent,
      sender: { name: 'Current User', email: 'me@example.com' },
      date: new Date().toISOString(),
      read: true
    };

    setThread(prev => ({
      ...prev,
      replies: [...(prev.replies || []), newReply]
    }));

    setReplyContent('');
    setReplyMode(null);
    enqueueSnackbar('Reply sent successfully', { variant: 'success' });
    
    if (onReply) {
      onReply(thread, newReply);
    }
  };

  const toggleReplyExpansion = (replyId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const handleToggleStar = () => {
    const updatedThread = {
      ...thread,
      isStarred: !thread.isStarred
    };
    setThread(updatedThread);
    onUpdateMessage && onUpdateMessage(updatedThread);
  };

  const handleMarkAsRead = (read = true) => {
    const updatedThread = {
      ...thread,
      read
    };
    setThread(updatedThread);
    onUpdateMessage && onUpdateMessage(updatedThread);
  };

  const formatMessageDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const renderMessageActions = (message) => (
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      <Tooltip title="Reply">
        <IconButton size="small" onClick={() => handleReply('reply')}>
          <ReplyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Forward">
        <IconButton size="small" onClick={() => handleReply('forward')}>
          <ForwardIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={message.isStarred ? 'Unstar' : 'Star'}>
        <IconButton size="small" onClick={handleToggleStar}>
          {message.isStarred ? (
            <StarIcon color="warning" fontSize="small" />
          ) : (
            <StarBorderIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="More actions">
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          {thread.subject}
        </Typography>
        <Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Main Message */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              {thread.sender?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">{thread.sender?.name || 'Unknown Sender'}</Typography>
              <Typography variant="caption" color="textSecondary">
                {formatMessageDate(thread.date)}
              </Typography>
            </Box>
          </Box>
          <Box>
            {thread.priority === 'high' && (
              <Chip
                label="High Priority"
                size="small"
                color="error"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            )}
            {thread.isPinned && (
              <Tooltip title="Pinned">
                <StarIcon color="warning" fontSize="small" />
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {thread.message || thread.content}
          </Typography>
        </Box>

        {thread.attachments?.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
              Attachments:
            </Typography>
            {thread.attachments.map((file, index) => (
              <Chip
                key={index}
                label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                variant="outlined"
                size="small"
                sx={{ mr: 1, mb: 1 }}
                onClick={() => window.open(file.url, '_blank')}
              />
            ))}
          </Box>
        )}

        {renderMessageActions(thread)}
      </Box>

      {/* Replies */}
      {thread.replies?.length > 0 && (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
          </Typography>
          
          <List disablePadding>
            {thread.replies.map((reply) => (
              <React.Fragment key={reply.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    pl: 4,
                    borderLeft: `3px solid ${theme.palette.divider}`,
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                      {reply.sender?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {reply.sender?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatMessageDate(reply.date)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: 'inline',
                            whiteSpace: 'pre-line',
                            wordBreak: 'break-word'
                          }}
                        >
                          {reply.content}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {/* Reply Form */}
      <Box sx={{ mt: 'auto' }}>
        {replyMode ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder={`${replyMode === 'forward' ? 'Add a message (optional)' : 'Type your reply here...'}`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  setReplyMode(null);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                color="primary"
                onClick={handleSendReply}
              >
                {replyMode === 'forward' ? 'Forward' : 'Send'}
              </Button>
            </Box>
          </Box>
        ) : (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a reply..."
            onClick={() => setReplyMode('reply')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReplyIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>

      {/* More Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMarkAsRead(!thread.read); handleMenuClose(); }}>
          {thread.read ? (
            <>
              <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
              Mark as Unread
            </>
          ) : (
            <>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Mark as Read
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ReportIcon fontSize="small" sx={{ mr: 1 }} />
          Report
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default MessageThread;
