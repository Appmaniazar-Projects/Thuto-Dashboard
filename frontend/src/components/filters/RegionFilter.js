import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import regionService from '../../services/regionService';

const RegionFilter = ({ onRegionChange, onProvinceChange, disabled = false }) => {
  const { isNationalSuperAdmin, isRegionalSuperAdmin, isProvincialSuperAdmin, currentUser } = useAuth();
  
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize based on user role
  useEffect(() => {
    initializeFilters();
  }, []);

  // Load regions when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadRegionsForProvince(selectedProvince);
    } else {
      setRegions([]);
    }
  }, [selectedProvince]);

  const initializeFilters = async () => {
    try {
      setLoading(true);
      setError('');

      if (isNationalSuperAdmin()) {
        // National admin can see all provinces and then filter regions by province
        await loadAllProvinces();
      } else if (isRegionalSuperAdmin()) {
        // Regional admin is restricted to their assigned region
        const userRegion = currentUser?.region;
        if (userRegion) {
          setSelectedRegion(userRegion);
          // Provinces are still needed for the province filter UI
          await loadAllProvinces();
        }
      } else if (isProvincialSuperAdmin()) {
        // Provincial admin is restricted to their assigned province
        const userProvince = currentUser?.province;
        if (userProvince) {
          setSelectedProvince(userProvince);
          await loadAllProvinces();
        }
      }
    } catch (err) {
      setError('Failed to initialize filters');
      console.error('Error initializing filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProvinces = async () => {
    try {
      const provincesData = await regionService.getAllProvinces();
      setProvinces(provincesData || []);

      // If the current user province is stored as a name, map it to the province id
      // so we can call GET /api/regions/by-province/{provinceId}.
      if (isProvincialSuperAdmin() && currentUser?.province && Array.isArray(provincesData)) {
        const provinceMatch = provincesData.find((province) => {
          if (!province) return false;
          if (typeof province === 'string') return province === currentUser.province;
          return province.name === currentUser.province;
        });

        if (provinceMatch && typeof provinceMatch === 'object' && provinceMatch.id) {
          setSelectedProvince(provinceMatch.id);
          onProvinceChange(provinceMatch.id);
        }
      }
    } catch (err) {
      console.error('Error loading all provinces:', err);
      // Fallback to hardcoded provinces
      setProvinces([
        'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
        'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
      ]);
    }
  };

  const loadRegionsForProvince = async (provinceId) => {
    try {
      const regionsData = await regionService.getRegionsByProvinceId(provinceId);
      setRegions(regionsData || []);
      if (selectedRegion) {
        const stillValid = (regionsData || []).some((region) => {
          const value = region?.name ?? region;
          return String(value) === String(selectedRegion);
        });
        if (!stillValid) {
          setSelectedRegion('');
          onRegionChange('');
        }
      }
    } catch (err) {
      console.error('Error loading regions for province:', err);
      setRegions([]);
    }
  };

  const handleRegionChange = (event) => {
    const newRegion = event.target.value;
    setSelectedRegion(newRegion);
    onRegionChange(newRegion);
  };

  const handleProvinceChange = (event) => {
    const newProvince = event.target.value;
    setSelectedProvince(newProvince);
    setSelectedRegion('');
    onProvinceChange(newProvince);
    onRegionChange('');
  };

  const getRoleLabel = () => {
    if (isNationalSuperAdmin()) return 'National Superadmin';
    if (isRegionalSuperAdmin()) return 'Regional Superadmin';
    if (isProvincialSuperAdmin()) return 'Provincial Superadmin';
    return 'Superadmin';
  };

  const getFilterDescription = () => {
    if (isRegionalSuperAdmin() && selectedRegion) {
      return `Showing data for ${selectedRegion}`;
    }
    if (isProvincialSuperAdmin() && selectedProvince) {
      const provinceName = provinces.find((province) => {
        if (!province) return false;
        if (typeof province === 'string') return province === selectedProvince;
        return String(province.id) === String(selectedProvince) || province.name === selectedProvince;
      });
      const label = typeof provinceName === 'object' ? provinceName.name : (provinceName || selectedProvince);
      return `Showing data for ${label}`;
    }
    if (selectedRegion && selectedProvince) {
      return `Showing data for ${selectedRegion} - ${selectedProvince}`;
    }
    if (selectedRegion) {
      return `Showing data for ${selectedRegion}`;
    }
    return 'Showing all data';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Loading regions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Role and Filter Info */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          <LocationIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            {getRoleLabel()}
          </Typography>
        </Box>
        <Chip 
          label={getFilterDescription()} 
          size="small" 
          variant="outlined" 
          color="primary"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Controls */}
      <Grid container spacing={2}>
        {/* Region Filter */}
        {isNationalSuperAdmin() && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={disabled || !selectedProvince}>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                label="Region"
                onChange={handleRegionChange}
              >
                <MenuItem value="">
                  <em>All Regions</em>
                </MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region.id || region.name || region} value={region.name || region}>
                    {region.name || region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Region Display for Regional Admin */}
        {isRegionalSuperAdmin() && selectedRegion && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled>
              <InputLabel>Region</InputLabel>
              <Select value={selectedRegion} label="Region">
                <MenuItem value={selectedRegion}>{selectedRegion}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Province Filter */}
        <Grid item xs={12} sm={isNationalSuperAdmin() || isRegionalSuperAdmin() ? 6 : 12}>
          <FormControl fullWidth size="small" disabled={disabled || isProvincialSuperAdmin()}>
            <InputLabel>Province</InputLabel>
            <Select
              value={selectedProvince}
              label="Province"
              onChange={handleProvinceChange}
            >
              <MenuItem value="">
                <em>All Provinces</em>
              </MenuItem>
              {provinces.map((province) => (
                <MenuItem key={province.id || province.name || province} value={province.id || province.name || province}>
                  {province.name || province}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Province Display for Provincial Admin */}
        {isProvincialSuperAdmin() && selectedProvince && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled>
              <InputLabel>Province</InputLabel>
              <Select value={selectedProvince} label="Province">
                <MenuItem value={selectedProvince}>{selectedProvince}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RegionFilter;
