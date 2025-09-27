import React, { useState, useEffect } from 'react';

// Import the new dedicated CSS file
import './Features.css';
import { useTranslation } from 'react-i18next';
import { CATEGORY_KEYS } from './utils/categoryApis';

interface FeatureItem {
  categoryKey: string;
  title: string;
  thumbnail: string;
}

// Category thumbnails mapping
const categoryThumbnails: Record<string, string> = {
  ctgSchemes: '🏛️',
  ctgJobs: '💼',
  ctgEducation: '📚',
  ctgHealth: '🏥',
  ctgAgriculture: '🌾',
  ctgBusiness: '🏢',
  ctgTechnology: '💻',
  ctgFinance: '💰',
  ctgTransport: '🚌',
  ctgTourism: '🏖️',
  ctgEnvironment: '🌱',
  ctgCulture: '🎭',
  ctgSports: '⚽',
  ctgScience: '🔬',
  ctgGovernment: '🏛️',
  ctgNGOs: '🤝',
  ctgOthers: '📋'
};

const Features: React.FC = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Get first 12 categories for features
  const featuresData: FeatureItem[] = CATEGORY_KEYS.slice(0, 12).map(categoryKey => ({
    categoryKey,
    title: categoryKey,
    thumbnail: categoryThumbnails[categoryKey] || '📋'
  }));

  // Calculate total slides (4 cards per slide)
  const cardsPerSlide = 4;
  const totalSlides = Math.ceil(featuresData.length / cardsPerSlide);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-heading">
          <h2>{t('featureServicesWeOffer')}</h2>
          <p>{t('featureServicesWeOfferDescription')}</p>
        </div>

        <div className="features-carousel">
          <div className="carousel-container">
            <div 
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="carousel-slide">
                  <div className="features-grid">
                    {featuresData
                      .slice(slideIndex * cardsPerSlide, (slideIndex + 1) * cardsPerSlide)
                      .map((feature, index) => (
                        <div className="features-item" key={feature.categoryKey}>
                          <div className="thumbnail">{feature.thumbnail}</div>
                          <h4>{t(feature.title)}</h4>
                          <div className="line-dec"></div>
                          <p>{t(`${feature.categoryKey}Description`, `Explore ${t(feature.title)} related services and information`)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>
            &#8249;
          </button>
          <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>
            &#8250;
          </button>

          {/* Dots indicator */}
          <div className="carousel-dots">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;