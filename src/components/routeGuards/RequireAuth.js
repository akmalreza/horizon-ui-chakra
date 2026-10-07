import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Flex, Spinner } from '@chakra-ui/react';
import { useAuth } from 'contexts/AuthContext';

export default function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
