import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Alert 
} from '@mui/material';
import { getAllUsers } from '../../services/adminService';
import PageTitle from '../../components/common/PageTitle';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await getAllUsers();
                setUsers(data);
            } catch (err) {
                setError('Failed to load users.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <Box>
            <PageTitle title="User Management" subtitle="View and manage all users in the system." />

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained">Add New User</Button>
            </Box>

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phoneNumber}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell align="right">
                                        {/* Action buttons (e.g., Edit, Delete) will go here */}
                                        <Button size="small">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default Users;
