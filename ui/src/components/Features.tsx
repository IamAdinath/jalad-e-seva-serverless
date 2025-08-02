import React from 'react';

// Import the new dedicated CSS file
import './Features.css';
import { useTranslation } from 'react-i18next';

interface FeatureItem {
  number: string;
  title: string;
  text: string;
}

const featuresData: FeatureItem[] = [
  { number: '01', title: 'featureForIndiduals', text: 'featureForIndidualsDescription' },
  { number: '02', title: 'featureForStudents', text: 'featureForStudentsDescription' },
  { number: '03', title: 'featureForFarmers', text: 'featureForFarmersDescription' },
  { number: '04', title: 'featureForBusinesses', text: 'featureForBusinessesDescription' },
];

const Features: React.FC = () => {
  const { t } = useTranslation();
  return (
     
    // We use our new class '.features-section'
    <section id="features" className="features-section">
      <div className="container">
        {/* RECOMMENDED: Add a section heading for context */}
        <div className="section-heading">
          <h2>{t('featureServicesWeOffer')}</h2>
          <p>{t('featureServicesWeOfferDescription')}</p>
        </div>

        <div className="features-grid">
          {featuresData.map((feature, index) => (
            <div className="features-item" key={index}>
              <div className="number">{t(feature.number)}</div>
              <h4>{t(feature.title)}</h4>
              <div className="line-dec"></div>
              <p>{t(feature.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;