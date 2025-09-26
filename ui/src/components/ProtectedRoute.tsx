import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const { isAuthenticated, isLoading, isAdmin, refreshToken, user } = useAuth();
  const { showError, showWarning } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  // Attempt token refresh if not authenticated but not loading
  useEffect(() => {
    const attemptRefresh = async () => {
      if (!isLoading && !isAuthenticated && !hasTriedRefresh) {
        setIsRefreshing(true);
        setHasTriedRefresh(true);
        
        try {
          const refreshed = await refreshToken();
          if (!refreshed) {
            showWarning('Your session has expired. Please log in again.');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    attemptRefresh();
  }, [isLoading, isAuthenticated, hasTriedRefresh, refreshToken, showWarning]);

  // Show loading state
  if (isLoading || isRefreshing) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ margin: 0, color: '#666' }}>
            {isRefreshing ? 'Refreshing session...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check admin privileges if required
  if (requireAdmin && !isAdmin()) {
    showError('Access denied. Admin privileges required.');
    return <Navigate to="/admin/login" replace />;
  }

  // Validate user data integrity
  if (!user || !user.username) {
    showError('Invalid user session. Please log in again.');
    return <Navigate to="/admin/login" replace />;
  }

  // Check token expiration
  if (user.expiresAt && user.expiresAt <= Date.now()) {
    showWarning('Your session has expired. Please log in again.');
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;