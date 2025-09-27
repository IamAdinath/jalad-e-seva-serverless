import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/images/logoindia.png';
import './AdminHeader.css';

const AdminHeader: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout, user } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess(t('adminLogoutSuccess'));
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showSuccess(t('adminLogoutSuccess')); // Still show success as user is logged out locally
      navigate('/');
    }
  };

  // Search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false); // Close mobile menu after search
    }
  };

  return (
    <header className={isSticky ? 'admin-header sticky' : 'admin-header'}>
      <div className="container">
        <nav className="navbar">

          <Link to="/admin/dashboard" className="logo">
            <img src={logo} alt="e-Seva Logo" className="logo-img" />
            <span className="logo-text">e-Seva Admin</span>
          </Link>



          <ul className={isMenuOpen ? 'nav-links active' : 'nav-links'}>
            <li><Link to="/admin/dashboard">{t('adminNavPublishedBlogs')}</Link></li>
            <li><Link to="/admin/drafts">{t('adminNavDraftBlogs')}</Link></li>
            <li><Link to="/admin/new-blog">{t('adminNavNewBlog')}</Link></li>
            <li><Link to="/admin/categories">{t('adminNavCategories')}</Link></li>

            {/* INTEGRATED SEARCH BAR */}
            <li className="nav-search-container">
              <form onSubmit={handleSearch} className="nav-search-form">
                <input
                  type="text"
                  className="nav-search-input"
                  placeholder={t('searchPlaceholder', 'Search What you looking for')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="nav-search-btn">
                  🔍
                </button>
              </form>
            </li>

            <li className="nav-translate">
              <LanguageSwitcher />
            </li>

            <li><Link to="/admin/dashboard">{user?.email}</Link></li>

            <li>
              <button onClick={handleLogout} className="logout-button">
                {t('adminNavLogout')}
              </button>
            </li>
          </ul>

          {/* HAMBURGER MENU BUTTON */}
          <button
            className={isMenuOpen ? 'menu-toggle active' : 'menu-toggle'}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;