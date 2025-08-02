import React, { useState, useEffect } from 'react';
import logo from '../assets/images/logoindia.png';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next'; 

// This line is CRITICAL. It imports the CSS file.
import './Header.css';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

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

  return (
    // The class will be "header" or "header sticky"
    <header className={isSticky ? 'header sticky' : 'header'}>
      <div className="container">
        <nav className="navbar">
          {/* LOGO */}
          <a href="/" className="logo">
            <img src={logo} alt="e-Seva Logo" className="logo-img" />
            <span className="logo-text">e-Seva</span>
          </a>

          {/* NAVIGATION LINKS */}
          {/* The class will be "nav-links" or "nav-links active" */}
          <ul className={isMenuOpen ? 'nav-links active' : 'nav-links'}>
            <li><a href="/">{t('navHome')}</a></li>
            <li><a href="/schemes">{t('navSchemes')}</a></li>
            <li><a href="/jobs">{t('navJobs')}</a></li>
            <li><a href="/students">{t('navStudents')}</a></li>
            <li className="nav-cta"><a href="/signup">{t('navSignUp')}</a></li>
            
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