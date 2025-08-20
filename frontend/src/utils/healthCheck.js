// Health check utility to test backend connectivity
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';

export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL.replace('/api', '')}/actuator/health`, {
      timeout: 5000,
    });
    return { status: 'healthy', data: response.data };
  } catch (error) {
    // Try a simple ping to the auth endpoint
    try {
      await axios.get(`${BACKEND_URL}/auth/ping`, { timeout: 5000 });
      return { status: 'healthy', message: 'Backend is responding' };
    } catch (pingError) {
      return { 
        status: 'unhealthy', 
        error: error.code === 'ECONNREFUSED' ? 'Backend server is not running' : error.message 
      };
    }
  }
};

export const testBackendConnection = async () => {
  console.log('Testing backend connection...');
  const health = await checkBackendHealth();
  console.log('Backend health check result:', health);
  return health;
};