import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'coaching_center_auth';
const PASSWORD_KEY = 'coaching_center_password';
const DEFAULT_PASSWORD = 'admin123'; // Default password for first time use

// Simple hash function for password (not cryptographically secure, but works for localStorage)
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem(STORAGE_KEY);
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Initialize default password if not set
    if (!localStorage.getItem(PASSWORD_KEY)) {
      localStorage.setItem(PASSWORD_KEY, hashPassword(DEFAULT_PASSWORD));
    }
  }, []);

  const login = (password: string): boolean => {
    const storedHash = localStorage.getItem(PASSWORD_KEY);
    const inputHash = hashPassword(password);
    
    if (storedHash === inputHash) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    const storedHash = localStorage.getItem(PASSWORD_KEY);
    const oldHash = hashPassword(oldPassword);
    
    if (storedHash === oldHash) {
      localStorage.setItem(PASSWORD_KEY, hashPassword(newPassword));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
