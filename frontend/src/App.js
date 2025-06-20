// src/App.js
// Main application component for Thuto School Management System
// Configures global providers, routing, and theme

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import custom theme for consistent UI styling
import theme from './styles/theme';

// Import pre-configured routes
import routes from './routes';

// Import authentication context provider
import AuthProvider from './context/AuthContext';

function App() {
  return (
    // ThemeProvider: Applies consistent Material-UI theme across the application
    <ThemeProvider theme={theme}>
      {/* CssBaseline: Normalizes styles and provides a consistent baseline */}
      <CssBaseline />

      {/* AuthProvider: Manages authentication state and provides user context */}
      <AuthProvider>
        {/* BrowserRouter: Enables client-side routing */}
        <BrowserRouter>
          {/* Routes: Dynamically renders routes based on configuration */}
          <Routes>
            {/* Map through routes to create Route components */}
            {routes.map((route, index) => (
              <Route 
                key={index} 
                path={route.path} 
                element={route.element} 
              />
            ))}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

// Key Application Architecture Principles:
// 1. Global theme management with Material-UI
// 2. Centralized routing configuration
// 3. Authentication context wrapping entire application
// 4. Modular and extensible component structure