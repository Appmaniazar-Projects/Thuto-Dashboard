// src/App.js
import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';

import './services/firebase';

// Routes
import { publicRoutes, protectedRoutes, superAdminRoutes } from './routes';

// Layouts
import Layout from './components/layout/Layout';
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import AuthLayout from './components/layout/AuthLayout';

// Contexts
import { EventsProvider } from './context/EventsContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SystemMessageProvider } from './context/SystemMessageContext';
import { DataProvider } from './context/DataContext';
import { SchoolBrandingProvider } from './context/SchoolBrandingContext';
import { ParentProvider } from './context/ParentContext';

// Theme
import theme from './styles/theme';

// Standalone pages (no layout wrapper)
const AdminLandingPage = lazy(() => import('./pages/superadmin/AdminLandingPage'));

const getTheme = (mode = 'light') => createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode,
    ...(mode === 'dark' ? {
      background: {
        default: '#121213',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
      },
    } : {}),
  },
});

// Scroll reset on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  const currentTheme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <AuthProvider>
      <SchoolBrandingProvider>
        <DataProvider>
          <ThemeProvider theme={currentTheme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <NotificationProvider>
                <SystemMessageProvider>
                  <EventsProvider>
                    <ParentProvider>
                      <ScrollToTop />
                      <Routes>

                        {/* ── Public routes (AuthLayout) ─────────────────── */}
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

                        {/* ── Standalone: school picker (no sidebar) ─────── */}
                        <Route
                          path="/multi-school/landing"
                          element={
                            <Suspense fallback={<div>Loading...</div>}>
                              <AdminLandingPage />
                            </Suspense>
                          }
                        />

                        {/* ── Protected routes (Layout with sidebar) ─────── */}
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

                        {/* ── Super Admin routes (SuperAdminLayout) ─────── */}
                        <Route element={<SuperAdminLayout />}>
                          {superAdminRoutes.map((route, i) => (
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
                    </ParentProvider>
                  </EventsProvider>
                </SystemMessageProvider>
              </NotificationProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </DataProvider>
      </SchoolBrandingProvider>
    </AuthProvider>
  );
}

export default App;