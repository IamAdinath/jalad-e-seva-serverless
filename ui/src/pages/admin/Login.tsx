import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validateForm = (): boolean => {
    if (!username.trim()) {
      showWarning('Please enter your username or email');
      return false;
    }

    if (!password.trim()) {
      showWarning('Please enter your password');
      return false;
    }

    if (password.length < 6) {
      showWarning('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        showSuccess('Login successful! Redirecting to dashboard...');
        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        // Handle specific error cases
        switch (result.errorCode) {
          case 'ACCESS_DENIED':
            showError('Access denied. You need admin privileges to access this area.');
            break;
          case 'UserNotFoundException':
          case 'NotAuthorizedException':
            showError('Invalid username or password. Please check your credentials.');
            break;
          case 'UserNotConfirmedException':
            showError('Please verify your email address before logging in.');
            break;
          case 'TooManyRequestsException':
            showError('Too many login attempts. Please wait a few minutes and try again.');
            break;
          case 'NEW_PASSWORD_REQUIRED':
            showError('Password change required. Please contact your administrator.');
            break;
          default:
            showError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="login-container">
          <div className="login-card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-card">
          <h2>Admin Login</h2>
          <p className="login-subtitle">Sign in with your AWS Cognito credentials</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                required
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="login-info">
            <p><strong>Admin Access Required</strong></p>
            <p>Only users with admin privileges can access this area.</p>
            <p>Contact your administrator if you need access.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;