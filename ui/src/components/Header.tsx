import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logoindia.png';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next'; 

// This line is CRITICAL. It imports the CSS file.
import './Header.css';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // This function adds the .sticky class to the header when you scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // This function toggles the .active class for the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus on search input when opened
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  return (
    // The class will be "header" or "header sticky"
    <header className={isSticky ? 'header sticky' : 'header'}>
      <div className="container">
        <nav className="navbar">
          {/* LOGO */}
          <Link to="/" className="logo">
            <img src={logo} alt="e-Seva Logo" className="logo-img" />
            <span className="logo-text">e-Seva</span>
          </Link>

          {/* SEARCH BAR */}
          <div className={`search-container ${isSearchOpen ? 'active' : ''}`}>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder={t('searchPlaceholder', 'Search blogs...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-submit-btn">
                🔍
              </button>
            </form>
          </div>

          {/* NAVIGATION LINKS */}
          {/* The class will be "nav-links" or "nav-links active" */}
          <ul className={isMenuOpen ? 'nav-links active' : 'nav-links'}>
            <li><Link to="/">{t('navHome')}</Link></li>
            <li><Link to="/Schemes">{t('navSchemes')}</Link></li>
            <li><Link to="/Jobs">{t('ctgJobs')}</Link></li>
            <li><Link to="/Services">{t('ctgServices')}</Link></li>
            <li><Link to="/Education">{t('ctgEducation')}</Link></li>
            <li><Link to="/Agriculture">{t('ctgAgriculture')}</Link></li>
            
            {/* SEARCH BUTTON */}
            <li className="nav-search">
              <button className="search-toggle-btn" onClick={toggleSearch} aria-label="Toggle search">
                🔍
              </button>
            </li>
            
            {/* ADD THE LANGUAGE SWITCHER HERE */}
            <li className="nav-translate">
              <LanguageSwitcher />
            </li>
          </ul>

          {/* HAMBURGER MENU BUTTON */}
          {/* The class will be "menu-toggle" or "menu-toggle active" */}
          <button className={isMenuOpen ? 'menu-toggle active' : 'menu-toggle'} onClick={toggleMenu} aria-label="Toggle menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;