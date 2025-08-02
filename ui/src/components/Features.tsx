import React from 'react';

// Import the new dedicated CSS file
import './Features.css';

interface FeatureItem {
  number: string;
  title: string;
  text: string;
}

const featuresData: FeatureItem[] = [
  { number: '01', title: 'For Individuals', text: 'Find all the service information you need for your personal certificates & documents.' },
  { number: '02', title: 'For Students', text: 'We have listed all the required and useful information that can help students.' },
  { number: '03', title: 'For Farmers', text: 'All the latest schemes and services from the government and others for Farmers.' },
  { number: '04', title: 'For Businesses', text: 'Find what the government has to offer you as a business owner for their growth.' },
];

const Features: React.FC = () => {
  return (
    // We use our new class '.features-section'
    <section id="features" className="features-section">
      <div className="container">
        {/* RECOMMENDED: Add a section heading for context */}
        <div className="section-heading">
          <h2>Services We Offer</h2>
          <p>We categorize all services to make them easy to find and access for everyone.</p>
        </div>

        {/* The grid of features */}
        <div className="features-grid">
          {featuresData.map((feature, index) => (
            // The item itself. No need for column classes like 'col-lg-3'
            // because the parent '.features-grid' now handles the layout.
            <div className="features-item" key={index}>
              <div className="number">{feature.number}</div>
              <h4>{feature.title}</h4>
              <div className="line-dec"></div>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;