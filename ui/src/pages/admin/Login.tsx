import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Login.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
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
      showWarning(t('adminLoginValidationUsername'));
      return false;
    }

    if (!password.trim()) {
      showWarning(t('adminLoginValidationPassword'));
      return false;
    }

    if (password.length < 6) {
      showWarning(t('adminLoginValidationPasswordLength'));
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
        showSuccess(t('adminLoginSuccess'));
        // Small delay to show success message before redirect
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        // Handle specific error cases
        switch (result.errorCode) {
          case 'ACCESS_DENIED':
            showError(t('adminLoginErrorAccess'));
            break;
          case 'UserNotFoundException':
          case 'NotAuthorizedException':
            showError(t('adminLoginErrorCredentials'));
            break;
          case 'UserNotConfirmedException':
            showError(t('adminLoginErrorVerification'));
            break;
          case 'TooManyRequestsException':
            showError(t('adminLoginErrorTooMany'));
            break;
          case 'NEW_PASSWORD_REQUIRED':
            showError(t('adminLoginErrorPassword'));
            break;
          default:
            showError(result.error || t('adminLoginErrorGeneral'));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(t('adminLoginErrorUnexpected'));
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
              <p>{t('adminLoginLoading')}</p>
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
          <h2>{t('adminLoginTitle')}</h2>
          <p className="login-subtitle">{t('adminLoginSubtitle')}</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">{t('adminLoginUsername')}</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('adminLoginUsernamePlaceholder')}
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">{t('adminLoginPassword')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('adminLoginPasswordPlaceholder')}
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
                  {t('adminLoginSigningIn')}
                </>
              ) : (
                t('adminLoginSignIn')
              )}
            </button>
          </form>
          
          <div className="login-info">
            <p><strong>{t('adminLoginInfoTitle')}</strong></p>
            <p>{t('adminLoginInfoDesc1')}</p>
            <p>{t('adminLoginInfoDesc2')}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;