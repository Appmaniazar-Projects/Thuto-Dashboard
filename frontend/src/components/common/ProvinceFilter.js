import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const PROVINCES = [
  'All Provinces',
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const ProvinceFilter = ({ selectedProvince, onProvinceChange, sx = {} }) => {
  const { isMaster, isProvincialSuperAdmin, currentUser } = useAuth();

  // Provincial superadmins can't change province - it's fixed to their assigned province
  if (isProvincialSuperAdmin()) {
    return (
      <Box sx={{ ...sx }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Province
        </Typography>
        <Typography variant="h6" color="primary">
          {currentUser?.province}
        </Typography>
      </Box>
    );
  }

  // Masters can filter by province
  if (isMaster()) {
    return (
      <FormControl sx={{ minWidth: 200, ...sx }}>
        <InputLabel>Filter by Province</InputLabel>
        <Select
          value={selectedProvince || 'All Provinces'}
          onChange={(e) => onProvinceChange(e.target.value === 'All Provinces' ? null : e.target.value)}
          label="Filter by Province"
        >
          {PROVINCES.map((province) => (
            <MenuItem key={province} value={province}>
              {province}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return null;
};

export default ProvinceFilter;
