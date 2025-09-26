import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { CognitoAuthService, type CognitoUserData, type AuthResult } from '../services/CognitoAuthService';
import { getCognitoConfig } from '../config/cognito';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CognitoUserData | null;
  userGroups: string[];
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<CognitoUserData | null>(null);
  const [authService, setAuthService] = useState<CognitoAuthService | null>(null);

  // Initialize Cognito service
  useEffect(() => {
    try {
      const config = getCognitoConfig();
      const service = new CognitoAuthService(config);
      setAuthService(service);
    } catch (error) {
      console.error('Failed to initialize Cognito service:', error);
      setIsLoading(false);
    }
  }, []);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!authService) return;

      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Try to refresh session
          const refreshed = await authService.refreshSession();
          if (refreshed) {
            const refreshedUser = await authService.getCurrentUser();
            if (refreshedUser) {
              setUser(refreshedUser);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (authService) {
      checkAuthStatus();
    }
  }, [authService]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!authService || !isAuthenticated || !user) return;

    const refreshInterval = setInterval(async () => {
      try {
        // Check if token expires in the next 5 minutes
        const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
        if (user.expiresAt <= fiveMinutesFromNow) {
          console.log('Token expiring soon, refreshing...');
          const refreshed = await authService.refreshSession();
          if (refreshed) {
            const refreshedUser = await authService.getCurrentUser();
            if (refreshedUser) {
              setUser(refreshedUser);
            }
          } else {
            console.warn('Token refresh failed, user may need to re-login');
          }
        }
      } catch (error) {
        console.error('Error during automatic token refresh:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [authService, isAuthenticated, user]);

  const login = async (username: string, password: string): Promise<AuthResult> => {
    if (!authService) {
      return {
        success: false,
        error: 'Authentication service not initialized',
        errorCode: 'SERVICE_ERROR'
      };
    }

    try {
      const result = await authService.signIn(username, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during login',
        errorCode: 'UNEXPECTED_ERROR'
      };
    }
  };

  const logout = async (): Promise<void> => {
    if (!authService) return;

    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!authService) return false;

    try {
      const refreshed = await authService.refreshSession();
      if (refreshed) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const isAdmin = (): boolean => {
    return authService?.isAdmin() || false;
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    userGroups: user?.groups || [],
    login,
    logout,
    refreshToken,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;