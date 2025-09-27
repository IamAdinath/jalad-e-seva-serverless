import React from 'react';

// Import the dedicated CSS file for the footer
import './Footer.css';
import { useTranslation } from 'react-i18next';

// You can use your own logo or import it if you have a separate dark-mode version
import logo from '../assets/images/logoindia.png';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  // Automatically gets the current year for the copyright notice
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">

          {/* Column 1: About the Site */}
          <div className="footer-about">
            <a href="/" className="footer-logo">
              <img src={logo} alt="e-Seva Logo" className="logo-img" />
              <span className="logo-text">e-Seva</span>
            </a>
            <p>
              {t('footerDescription')}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-links">
            <h4>{t('footerQuickLinks')}</h4>
            <ul>
              <li><a href="/schemes">{t('ctgSchemes')}</a></li>
              <li><a href="/jobs">{t('ctgJobs')}</a></li>
              <li><a href="/education">{t('ctgEducation')}</a></li>
              <li><a href="/#contact">{t('footerContact')}</a></li>
            </ul>
          </div>

          {/* Column 3: Social & Legal */}
          <div className="footer-links">
            <h4>{t('footerLegal')}</h4>
            <ul>
              <li><a href="/privacy-policy">{t('footerPrivacy')}</a></li>
              <li><a href="/terms-of-service">{t('footerTerms')}</a></li>
              <li><a href="/admin/login">{t('navAdmin')}</a></li>
            </ul>
          </div>

          {/* Column 4: Contact/Social */}
          <div className="footer-contact">
             <h4>{t('footerFollowUs')}</h4>
             <div className="social-icons">
                <a href="#" aria-label="Facebook">F</a>
                <a href="#" aria-label="Twitter">T</a>
                <a href="#" aria-label="Instagram">I</a>
             </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© {currentYear} {t('footerText')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;