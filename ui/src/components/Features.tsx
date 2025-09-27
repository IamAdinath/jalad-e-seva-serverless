import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
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

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

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
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="carousel-slide">
                  <div className="features-grid">
                    {featuresData
                      .slice(slideIndex * cardsPerSlide, (slideIndex + 1) * cardsPerSlide)
                      .map((feature) => {
                        // Extract category name from key (remove 'ctg' prefix)
                        const categoryName = feature.categoryKey.replace('ctg', '').toLowerCase();
                        return (
                          <Link 
                            to={`/category/${categoryName}`} 
                            className="features-item-link" 
                            key={feature.categoryKey}
                          >
                            <div className="features-item">
                              <div className="thumbnail">{feature.thumbnail}</div>
                              <h4>{t(feature.title)}</h4>
                              <div className="line-dec"></div>
                              <p>{t(`${feature.categoryKey}Description`, `Explore ${t(feature.title)} related services and information`)}</p>
                              <div className="explore-btn">
                                {t('exploreMore', 'Explore More')} →
                              </div>
                            </div>
                          </Link>
                        );
                      })}
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