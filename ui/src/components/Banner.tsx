import React from 'react';

// Import the dedicated CSS file for this banner
import './Banner.css';

const Banner: React.FC = () => {
  return (
    <section className="hero-banner">
      <div className="container">
        <div className="banner-content">
          <h1 className="hero-title">
            Empowering Your Journey with e-Seva
          </h1>
          <p className="hero-subtitle">
            All government schemes, jobs, and services at your fingertips.
            Simple, fast, and reliable.
          </p>
          <a href="/schemes" className="cta-button">
            Explore Services
          </a>
        </div>
      </div>
    </section>
  );
};

export default Banner;