import React from 'react';

// Import the dedicated CSS file for the footer
import './Footer.css';

// You can use your own logo or import it if you have a separate dark-mode version
import logo from '../assets/images/logoindia.png';

const Footer: React.FC = () => {
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
              Your one-stop portal for government services, schemes, and opportunities.
              Making access simple and transparent for every citizen.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/schemes">Schemes</a></li>
              <li><a href="/jobs">Jobs</a></li>
              <li><a href="/students">Students</a></li>
              <li><a href="/#contact">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Social & Legal */}
          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 4: Contact/Social */}
          <div className="footer-contact">
             <h4>Follow Us</h4>
             <div className="social-icons">
                <a href="#" aria-label="Facebook">F</a>
                <a href="#" aria-label="Twitter">T</a>
                <a href="#" aria-label="Instagram">I</a>
             </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© {currentYear} e-Seva. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;