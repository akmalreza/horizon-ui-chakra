import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiError, setUnauthorizedHandler } from 'lib/apiClient';
import * as authService from 'lib/authService';
import * as authStorage from 'lib/authStorage';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setToken(null);
    setStatus('unauthenticated');
  }, []);

  const refetch = useCallback(async () => {
    try {
      const profile = await authService.fetchMe();
      setUser(profile);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
      }
    }
  }, [clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    const session = authStorage.load();
    if (!session || !session.token) {
      setStatus('unauthenticated');
      return;
    }

    setUser(session.user || null);
    setToken(session.token);
    setStatus('authenticated');
    refetch();
  }, [clearSession, refetch]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const session = await authService.login(email, password);
      authStorage.save(session);
      setUser(session.user || null);
      setToken(session.token);
      setStatus('authenticated');
      return session;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setError(null);
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isAuthenticated: status === 'authenticated',
      error,
      login,
      logout,
      refetch,
    }),
    [user, token, status, error, login, logout, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
