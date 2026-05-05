import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import parentService from '../../services/parentService';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ParentApproval = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingParents, setPendingParents] = useState([]);
  const [approvedParents, setApprovedParents] = useState([]);
  const [rejectedParents, setRejectedParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingRegistrations();
    fetchApprovedParents();
    fetchRejectedParents();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await parentService.getPendingParents();
      setPendingParents(response || []);
    } catch (err) {
      console.error('Failed to fetch pending registrations:', err);
      setError('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedParents = async () => {
    try {
      const response = await parentService.getApprovedParents();
      setApprovedParents(response || []);
    } catch (err) {
      console.error('Failed to fetch approved parents:', err);
    }
  };

  const fetchRejectedParents = async () => {
    try {
      const response = await parentService.getRejectedParents();
      setRejectedParents(response || []);
    } catch (err) {
      console.error('Failed to fetch rejected parents:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewParent = (parent) => {
    setSelectedParent(parent);
    setViewDialogOpen(true);
  };

  const handleApproveParent = async (parentId) => {
    try {
      setLoading(true);
      await parentService.approveParent(parentId);
      
      setSuccess('Parent account approved successfully!');
      fetchPendingRegistrations();
      fetchApprovedParents();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve parent account');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectParent = (parent) => {
    setSelectedParent(parent);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const confirmRejectParent = async () => {
    try {
      setLoading(true);
      await parentService.rejectParent(selectedParent.id, rejectionReason);
      
      setSuccess('Parent registration rejected');
      setRejectDialogOpen(false);
      fetchPendingRegistrations();
      fetchRejectedParents();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject parent registration');
    } finally {
      setLoading(false);
    }
  };

  const handleResendApproval = async (parentId) => {
    try {
      setLoading(true);
      await parentService.resendApprovalEmail(parentId);
      setSuccess('Approval email sent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send approval email');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending_approval: { color: 'warning', label: 'Pending Approval' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' },
      active: { color: 'success', label: 'Active' }
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const renderParentTable = (parents, showApproveReject = true) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>School</TableCell>
            <TableCell>Student(s)</TableCell>
            <TableCell>Registration Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography color="text.secondary">
                  No parents found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            parents.map((parent) => (
              <TableRow key={parent.id}>
                <TableCell>
                  <Typography fontWeight="medium">
                    {parent.firstName} {parent.lastName}
                  </Typography>
                </TableCell>
                <TableCell>{parent.email}</TableCell>
                <TableCell>{parent.phoneNumber}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.school?.name || 'Unknown School'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {parent.studentNames}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(parent.registrationDate || parent.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {getStatusChip(parent.status)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewParent(parent)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {showApproveReject && parent.status === 'pending_approval' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveParent(parent.id)}
                            disabled={loading}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectParent(parent)}
                            disabled={loading}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    {parent.status === 'approved' && (
                      <Tooltip title="Resend Approval Email">
                        <IconButton
                          size="small"
                          onClick={() => handleResendApproval(parent.id)}
                          disabled={loading}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Parent Registration Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and approve parent registration requests
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchPendingRegistrations();
            fetchApprovedParents();
            fetchRejectedParents();
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Pending Approval
                  <Chip label={pendingParents.length} size="small" color="warning" />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Approved
                  <Chip label={approvedParents.length} size="small" color="success" />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Rejected
                  <Chip label={rejectedParents.length} size="small" color="error" />
                </Box>
              }
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderParentTable(pendingParents, true)
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderParentTable(approvedParents, false)}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {renderParentTable(rejectedParents, false)}
        </TabPanel>
      </Card>

      {/* View Parent Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonIcon />
            Parent Registration Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedParent && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                <Typography>{selectedParent.firstName} {selectedParent.lastName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{selectedParent.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone Number</Typography>
                <Typography>{selectedParent.phoneNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">ID Number</Typography>
                <Typography>{selectedParent.idNumber || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography>
                  {selectedParent.address}, {selectedParent.city}, {selectedParent.province} {selectedParent.postalCode}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">School</Typography>
                <Typography>{selectedParent.school?.name || 'Unknown'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Relationship</Typography>
                <Typography>{selectedParent.relationshipToStudent}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Student(s)</Typography>
                <Typography>{selectedParent.studentNames}</Typography>
              </Grid>
              {selectedParent.studentGrade && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Grade(s)</Typography>
                  <Typography>{selectedParent.studentGrade}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Registration Date</Typography>
                <Typography>
                  {new Date(selectedParent.registrationDate || selectedParent.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                {getStatusChip(selectedParent.status)}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedParent?.status === 'pending_approval' && (
            <>
              <Button
                color="error"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleRejectParent(selectedParent);
                }}
                disabled={loading}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleApproveParent(selectedParent.id);
                }}
                disabled={loading}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Parent Registration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this parent registration. This will be communicated to the parent.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmRejectParent}
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Reject Registration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentApproval;
