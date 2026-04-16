import api from './api';

const PROVINCE_BASE = '/provinces';
const REGION_BASE = '/regions';

// Get all provinces
export const getAllProvinces = async () => {
  try {
    const response = await api.get(`${PROVINCE_BASE}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all provinces:', error);
    // Fallback to hardcoded provinces if backend fails
    return [
      'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
      'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
    ];
  }
};

// Get regions within a specific province
export const getRegionsByProvinceId = async (provinceId) => {
  try {
    const response = await api.get(`${REGION_BASE}/by-province/${provinceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching regions for province ${provinceId}:`, error);
    throw error;
  }
};

// Get all regions (for mapping regionalId to region names)
export const getAllRegions = async () => {
  try {
    const response = await api.get(`${REGION_BASE}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all regions:', error);
    throw error;
  }
};

const regionService = {
  getAllProvinces,
  getRegionsByProvinceId,
  getAllRegions
};

export default regionService;
