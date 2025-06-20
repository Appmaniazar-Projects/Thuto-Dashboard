// src/context/AuthContext.js
// Authentication Context for Thuto School Management System
// Manages user authentication state and provides authentication utilities

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for sharing authentication state across components
const AuthContext = createContext();

// Custom hook to easily access authentication context
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  // State to track current authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  
  // Loading state to prevent rendering before authentication check
  const [loading, setLoading] = useState(true);

  // Check for existing user session on initial application load
  // Retrieves user data from local storage to maintain session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Restore user session if previous login exists
      setCurrentUser(JSON.parse(storedUser));
    }
    // Mark loading as complete to render application
    setLoading(false);
  }, []);

  // Login function to authenticate user and store session
  const login = (userData, token) => {
    // Update current user state
    setCurrentUser(userData);
    
    // Persist user data and authentication token in local storage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  // Logout function to clear user session
  const logout = () => {
    // Clear current user state
    setCurrentUser(null);
    
    // Remove user data and token from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Provide authentication-related values and methods to child components
  const value = {
    currentUser,   // Current authenticated user
    login,         // Method to log in user
    logout,        // Method to log out user
    loading        // Loading state for initial authentication check
  };

  return (
    // Provide authentication context to all child components
    <AuthContext.Provider value={value}>
      {/* Only render children after loading state is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// Key Authentication Principles:
// 1. Centralized authentication state management
// 2. Persistent user sessions using local storage
// 3. Secure context for sharing authentication information
// 4. Prevents rendering before authentication check is complete