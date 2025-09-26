import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import type { CognitoConfig } from '../config/cognito';

export interface AuthResult {
  success: boolean;
  user?: CognitoUserData;
  error?: string;
  errorCode?: string;
}

export interface CognitoUserData {
  username: string;
  email: string;
  groups: string[];
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface StoredAuth {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    username: string;
    email: string;
    groups: string[];
  };
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: 'NETWORK' | 'AUTH' | 'PERMISSION' | 'TOKEN'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class CognitoAuthService {
  private userPool: CognitoUserPool;
  private currentUser: CognitoUser | null = null;
  private readonly STORAGE_KEY = 'cognito_auth';

  // Error message mapping
  private readonly ERROR_MESSAGES: Record<string, string> = {
    'UserNotFoundException': 'Invalid username or password.',
    'NotAuthorizedException': 'Invalid username or password.',
    'UserNotConfirmedException': 'Please verify your email address.',
    'PasswordResetRequiredException': 'Password reset required.',
    'UserLambdaValidationException': 'User validation failed.',
    'TooManyRequestsException': 'Too many attempts. Please try again later.',
    'NetworkError': 'Connection failed. Please check your internet connection.',
    'InvalidParameterException': 'Invalid request parameters.',
    'CodeMismatchException': 'Invalid verification code.',
    'ExpiredCodeException': 'Verification code has expired.',
  };

  constructor(config: CognitoConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.userPoolWebClientId,
    });
  }

  /**
   * Sign in user with username and password
   */
  async signIn(username: string, password: string): Promise<AuthResult> {
    return new Promise((resolve) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          try {
            this.currentUser = cognitoUser;
            const userData = await this.extractUserData(session, cognitoUser);
            
            // Check if user is in admin group
            if (!userData.groups.includes('admin')) {
              resolve({
                success: false,
                error: 'You don\'t have permission to access the admin area.',
                errorCode: 'ACCESS_DENIED'
              });
              return;
            }

            // Store authentication data
            this.storeAuthData(userData);
            
            resolve({
              success: true,
              user: userData,
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to process authentication.',
              errorCode: 'PROCESSING_ERROR'
            });
          }
        },
        onFailure: (error) => {
          const errorMessage = this.ERROR_MESSAGES[error.code] || error.message || 'Authentication failed.';
          resolve({
            success: false,
            error: errorMessage,
            errorCode: error.code,
          });
        },
        newPasswordRequired: () => {
          resolve({
            success: false,
            error: 'Password change required. Please contact administrator.',
            errorCode: 'NEW_PASSWORD_REQUIRED'
          });
        },
      });
    });
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      if (this.currentUser) {
        this.currentUser.signOut(() => {
          this.currentUser = null;
          this.clearStoredAuth();
          resolve();
        });
      } else {
        this.clearStoredAuth();
        resolve();
      }
    });
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<CognitoUserData | null> {
    return new Promise((resolve) => {
      const cognitoUser = this.userPool.getCurrentUser();
      
      if (!cognitoUser) {
        // Check stored auth
        const storedAuth = this.getStoredAuth();
        if (storedAuth && storedAuth.expiresAt > Date.now()) {
          resolve({
            username: storedAuth.user.username,
            email: storedAuth.user.email,
            groups: storedAuth.user.groups,
            accessToken: storedAuth.accessToken,
            idToken: storedAuth.idToken,
            refreshToken: storedAuth.refreshToken,
            expiresAt: storedAuth.expiresAt,
          });
          return;
        }
        resolve(null);
        return;
      }

      cognitoUser.getSession((error: any, session: CognitoUserSession | null) => {
        if (error || !session || !session.isValid()) {
          resolve(null);
          return;
        }

        this.extractUserData(session, cognitoUser)
          .then(userData => {
            this.currentUser = cognitoUser;
            resolve(userData);
          })
          .catch(() => resolve(null));
      });
    });
  }

  /**
   * Refresh authentication session
   */
  async refreshSession(): Promise<boolean> {
    return new Promise((resolve) => {
      const cognitoUser = this.userPool.getCurrentUser();
      
      if (!cognitoUser) {
        resolve(false);
        return;
      }

      cognitoUser.getSession((error: any, session: CognitoUserSession | null) => {
        if (error || !session) {
          resolve(false);
          return;
        }

        if (session.isValid()) {
          resolve(true);
          return;
        }

        // Try to refresh with refresh token
        const refreshToken = session.getRefreshToken();
        cognitoUser.refreshSession(refreshToken, (refreshError, newSession) => {
          if (refreshError || !newSession) {
            resolve(false);
            return;
          }

          this.extractUserData(newSession, cognitoUser)
            .then(userData => {
              this.storeAuthData(userData);
              resolve(true);
            })
            .catch(() => resolve(false));
        });
      });
    });
  }

  /**
   * Check if current session is valid
   */
  isAuthenticated(): boolean {
    const storedAuth = this.getStoredAuth();
    return storedAuth !== null && storedAuth.expiresAt > Date.now();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const storedAuth = this.getStoredAuth();
    return storedAuth?.user.groups.includes('admin') || false;
  }

  /**
   * Extract user data from Cognito session
   */
  private async extractUserData(session: CognitoUserSession, cognitoUser: CognitoUser): Promise<CognitoUserData> {
    const accessToken = session.getAccessToken();
    const idToken = session.getIdToken();
    const refreshToken = session.getRefreshToken();

    // Extract user attributes
    const payload = idToken.payload;
    const username = payload['cognito:username'] || payload.sub;
    const email = payload.email || '';

    // Extract groups from access token
    const groups = accessToken.payload['cognito:groups'] || [];

    return {
      username,
      email,
      groups,
      accessToken: accessToken.getJwtToken(),
      idToken: idToken.getJwtToken(),
      refreshToken: refreshToken.getToken(),
      expiresAt: accessToken.getExpiration() * 1000, // Convert to milliseconds
    };
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(userData: CognitoUserData): void {
    const authData: StoredAuth = {
      accessToken: userData.accessToken,
      idToken: userData.idToken,
      refreshToken: userData.refreshToken,
      expiresAt: userData.expiresAt,
      user: {
        username: userData.username,
        email: userData.email,
        groups: userData.groups,
      },
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.warn('Failed to store auth data:', error);
    }
  }

  /**
   * Get stored authentication data
   */
  private getStoredAuth(): StoredAuth | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const authData: StoredAuth = JSON.parse(stored);
      
      // Validate stored data structure
      if (!authData.user || !authData.accessToken || !authData.expiresAt) {
        this.clearStoredAuth();
        return null;
      }

      return authData;
    } catch (error) {
      console.warn('Failed to parse stored auth data:', error);
      this.clearStoredAuth();
      return null;
    }
  }

  /**
   * Clear stored authentication data
   */
  private clearStoredAuth(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear stored auth data:', error);
    }
  }

  /**
   * Validate JWT token format (basic validation)
   */
  isTokenValid(token: string): boolean {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }
}