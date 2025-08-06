// src/App.js
import React, { useEffect } from 'react';
import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

import './services/firebase';

// Routes
import { publicRoutes, protectedRoutes } from './routes';

// Layouts
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Contexts
import { EventsProvider } from './context/EventsContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SystemMessageProvider } from './context/SystemMessageContext';

// Theme
import theme from './styles/theme';

const getTheme = (mode = 'light') => createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode,
    ...(mode === 'dark' ? {
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
      },
    } : {}),
  },
});

// Scroll reset
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// App component
function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  const currentTheme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <NotificationProvider>
            <SystemMessageProvider>
              <EventsProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    {/* Public routes - AuthLayout */}
                    {publicRoutes.map((route, i) => (
                      <Route
                        key={i}
                        path={route.path}
                        element={
                          <Suspense fallback={<div>Loading...</div>}>
                            <AuthLayout>{route.element}</AuthLayout>
                          </Suspense>
                        }
                      />
                    ))}

                    {/* Protected routes - Main Layout */}
                    <Route element={<Layout />}>
                      {protectedRoutes.map((route, i) => (
                        <Route
                          key={i}
                          path={route.path}
                          element={
                            <Suspense fallback={<div>Loading...</div>}>
                              {route.element}
                            </Suspense>
                          }
                        />
                      ))}
                    </Route>
                  </Routes>
                </BrowserRouter>
              </EventsProvider>
            </SystemMessageProvider>
          </NotificationProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
