import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import LanguageSwitcher from './LanguageSwitcher';
import logo from '../assets/images/logoindia.png';
import './AdminHeader.css';

const AdminHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
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
      showSuccess('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showSuccess('Logged out successfully'); // Still show success as user is logged out locally
      navigate('/');
    }
  };

  return (
    <header className={isSticky ? 'admin-header sticky' : 'admin-header'}>
      <div className="container">
        <nav className="navbar">
          {/* LOGO */}
          <Link to="/admin/dashboard" className="logo">
            <img src={logo} alt="e-Seva Logo" className="logo-img" />
            <span className="logo-text">e-Seva Admin</span>
          </Link>

          {/* NAVIGATION LINKS */}
          <ul className={isMenuOpen ? 'nav-links active' : 'nav-links'}>
            <li><Link to="/admin/dashboard">Published Blogs</Link></li>
            <li><Link to="/admin/drafts">Draft Blogs</Link></li>
            <li><Link to="/admin/new-blog">New Blog</Link></li>
            <li><Link to="/admin/categories">Categories</Link></li>
            
            {/* LANGUAGE SWITCHER */}
            <li className="nav-translate">
              <LanguageSwitcher />
            </li>
            
            {user && (
              <li className="user-info">
                <span className="user-name">
                  {user.email || user.username}
                </span>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
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