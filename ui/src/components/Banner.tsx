import React from 'react';

// Import the dedicated CSS file for this banner
import './Banner.css';
import { useTranslation } from 'react-i18next';

const Banner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="hero-banner">
      <div className="container">
        <div className="banner-content">
          <h1 className="hero-title">
            {t('heroTitle')}
          </h1>
          <p className="hero-subtitle">
            {t('heroSubtitle')}
          </p>
          <a href="/schemes" className="cta-button">
            {t('heroCTA')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Banner;