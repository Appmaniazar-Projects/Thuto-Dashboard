import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
];

const ProvinceFilter = ({ selectedProvince, onProvinceChange }) => {
  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="province-filter-label">Filter by Province</InputLabel>
        <Select
          labelId="province-filter-label"
          id="province-filter"
          value={selectedProvince || ''}
          label="Filter by Province"
          onChange={(e) => onProvinceChange(e.target.value || null)}
          displayEmpty
        >
          <MenuItem value="">
            <em>All Provinces</em>
          </MenuItem>
          {PROVINCES.map((province) => (
            <MenuItem key={province} value={province}>
              {province}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ProvinceFilter;
