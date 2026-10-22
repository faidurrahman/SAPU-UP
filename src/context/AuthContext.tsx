import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, authenticateUser } from '../types/auth';

const AUTH_STORAGE_KEY = 'sapu_up_auth_user_session_v1';

interface AuthContextType {
  currentUser: AuthUser | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth session to localStorage:', e);
    }
  }, [currentUser]);

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const result = authenticateUser(username, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || 'Autentikasi gagal.' };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear auth storage:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
