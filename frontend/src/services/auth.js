import api from './api';

const register = (userData) => {
    return api.post('/auth/register', userData);
};

const login = async (phone) => {
    // This would be the real API call
    const response = await api.post('/auth/login', { phone });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const sendOTP = async (phone) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
};

const verifyOTP = async (phone, otp) => {
    const response = await api.post('/auth/verify-otp', { phone, otp });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const adminLogin = async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const superAdminLogin = async (email, password) => {
    const response = await api.post('/auth/superadmin/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const authService = {
    register,
    login,
    sendOTP,
    verifyOTP,
    adminLogin,
    superAdminLogin,
    logout,
    getCurrentUser,
};

export default authService;