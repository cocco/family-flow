import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'parent' | 'child';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  monthlyAllowance: number;
}

export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = (user: User): void => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const switchRole = (role: UserRole): void => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const value: AppContextType = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchRole,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
