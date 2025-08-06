import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  FormHelperText
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useSnackbar } from 'notistack';

const MessageComposer = ({ open, onClose, onSend }) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    recipients: [],
    recipientType: 'individual', // 'individual', 'class', 'grade', 'all'
    selectedClass: '',
    selectedGrade: '',
    priority: 'normal',
    attachments: []
  });

  // Mock data - replace with actual API calls
  const classes = [
    { id: 'class1', name: 'Class 1A', grade: 'Grade 1' },
    { id: 'class2', name: 'Class 2B', grade: 'Grade 2' },
    { id: 'class3', name: 'Class 3C', grade: 'Grade 3' },
  ];

  const users = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'teacher' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'parent' },
    { id: 'user3', name: 'Student One', email: 'student1@example.com', role: 'student', grade: 'Grade 1' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecipientTypeChange = (e) => {
    const recipientType = e.target.value;
    setFormData(prev => ({
      ...prev,
      recipientType,
      recipients: [], // Clear recipients when changing type
      selectedClass: '',
      selectedGrade: ''
    }));
  };

  const handleAddRecipient = (recipient) => {
    if (!formData.recipients.some(r => r.id === recipient.id)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, recipient]
      }));
    }
  };

  const handleRemoveRecipient = (recipientId) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r.id !== recipientId)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.body.trim()) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    if (formData.recipients.length === 0 && formData.recipientType !== 'all') {
      enqueueSnackbar('Please select at least one recipient', { variant: 'error' });
      return;
    }

    try {
      // Prepare message data
      const messageData = {
        subject: formData.subject,
        body: formData.body,
        priority: formData.priority,
        sender: user.id,
        type: formData.recipientType === 'individual' ? 'direct' : 'group',
        recipients: formData.recipients.map(r => r.id),
        recipientType: formData.recipientType,
        metadata: {
          classId: formData.selectedClass,
          grade: formData.selectedGrade
        }
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      formData.attachments.forEach((attachment, index) => {
        formDataToSend.append(`attachments`, attachment.file);
      });
      formDataToSend.append('message', JSON.stringify(messageData));

      // Send message
      const response = await api.post('/messages', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      enqueueSnackbar('Message sent successfully', { variant: 'success' });
      onSend && onSend(response.data);
      handleClose();
    } catch (error) {
      console.error('Error sending message:', error);
      enqueueSnackbar('Failed to send message', { variant: 'error' });
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      subject: '',
      body: '',
      recipients: [],
      recipientType: 'individual',
      selectedClass: '',
      selectedGrade: '',
      priority: 'normal',
      attachments: []
    });
    onClose();
  };

  const filteredUsers = users.filter(user => {
    if (formData.recipientType === 'individual') return true;
    if (formData.recipientType === 'class' && formData.selectedClass) {
      return user.classId === formData.selectedClass;
    }
    if (formData.recipientType === 'grade' && formData.selectedGrade) {
      return user.grade === formData.selectedGrade;
    }
    return false;
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          {/* Recipient Selection */}
          <Box mb={3}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Recipient Type</InputLabel>
              <Select
                name="recipientType"
                value={formData.recipientType}
                onChange={handleRecipientTypeChange}
                label="Recipient Type"
              >
                <MenuItem value="individual">
                  <Box display="flex" alignItems="center">
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    Individual
                  </Box>
                </MenuItem>
                <MenuItem value="class">
                  <Box display="flex" alignItems="center">
                    <ClassIcon fontSize="small" sx={{ mr: 1 }} />
                    Class
                  </Box>
                </MenuItem>
                <MenuItem value="grade">
                  <Box display="flex" alignItems="center">
                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                    Grade
                  </Box>
                </MenuItem>
                <MenuItem value="all">
                  <Box display="flex" alignItems="center">
                    <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                    All Users
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {formData.recipientType === 'class' && (
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Select Class</InputLabel>
                <Select
                  name="selectedClass"
                  value={formData.selectedClass}
                  onChange={handleChange}
                  label="Select Class"
                >
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {formData.recipientType === 'grade' && (
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Select Grade</InputLabel>
                <Select
                  name="selectedGrade"
                  value={formData.selectedGrade}
                  onChange={handleChange}
                  label="Select Grade"
                >
                  {Array.from(new Set(classes.map(cls => cls.grade))).map(grade => (
                    <MenuItem key={grade} value={grade}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {(formData.recipientType === 'individual' || 
              (formData.recipientType === 'class' && formData.selectedClass) ||
              (formData.recipientType === 'grade' && formData.selectedGrade)) && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Recipients</InputLabel>
                <Select
                  multiple
                  value={formData.recipients}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      recipients: e.target.value
                    }));
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((recipient) => (
                        <Chip
                          key={recipient.id}
                          label={recipient.name}
                          onDelete={() => handleRemoveRecipient(recipient.id)}
                          onMouseDown={(e) => e.stopPropagation()}
                          size="small"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  {filteredUsers.map((user) => (
                    <MenuItem key={user.id} value={user}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', mr: 1 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {formData.recipients.length} recipient{formData.recipients.length !== 1 ? 's' : ''} selected
                </FormHelperText>
              </FormControl>
            )}

            {formData.recipientType === 'all' && (
              <Box mt={2}>
                <Chip
                  icon={<GroupIcon />}
                  label="All Users"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  This message will be sent to all users in the system.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Message Subject */}
          <TextField
            fullWidth
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
          />

          {/* Priority */}
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          {/* Message Body */}
          <TextField
            fullWidth
            label="Message"
            name="body"
            value={formData.body}
            onChange={handleChange}
            margin="normal"
            required
            multiline
            rows={8}
            variant="outlined"
            placeholder="Type your message here..."
          />

          {/* File Attachments */}
          <Box mt={2}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
            />
            <Button
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current.click()}
              size="small"
              sx={{ mr: 1, mb: 1 }}
            >
              Attach Files
            </Button>
            
            {formData.attachments.length > 0 && (
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  Attachments ({formData.attachments.length}):
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                      onDelete={() => handleRemoveAttachment(index)}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            startIcon={<SendIcon />}
          >
            Send
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MessageComposer;
