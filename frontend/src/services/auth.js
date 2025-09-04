import api from './api';
import { auth } from './firebase';

const login = async (phone) => {
    // This would be the real API call
    const response = await api.post('/auth/login', { phone });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

const verifyOTP = async (phone, otp) => {
    try {
        // First verify OTP with Firebase and get the Firebase user
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser) {
            throw new Error('No Firebase user found. Please try again.');
        }

        // Get Firebase ID token
        const firebaseToken = await firebaseUser.getIdToken();
        
        // Send Firebase token to backend for verification and user creation/login
        const response = await api.post('/auth/verify-otp', { 
            phone, 
            otp,
            firebaseToken 
        });
        
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
        }
        
        return response.data;
    } catch (error) {
        console.error('OTP verification failed:', error);
        throw error;
    }
};

// send token to backend

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
    login,
    verifyOTP,
    adminLogin,
    superAdminLogin,
    logout,
    getCurrentUser,
};

export default authService;