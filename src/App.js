import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import AppLayout from './layouts/app';
import RTLLayout from './layouts/rtl';
import RequireAuth from 'components/routeGuards/RequireAuth';
import { AuthProvider } from 'contexts/AuthContext';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useState } from 'react';
// Chakra imports

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  return (
    <ChakraProvider theme={currentTheme}>
      <AuthProvider>
        <Routes>
          <Route path="auth/*" element={<AuthLayout />} />
          <Route
            path="admin/*"
            element={
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          <Route element={<RequireAuth />}>
            <Route
              path="app/*"
              element={
                <AppLayout theme={currentTheme} setTheme={setCurrentTheme} />
              }
            />
          </Route>
          <Route
            path="rtl/*"
            element={
              <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          <Route path="/" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </ChakraProvider>
  );
}
