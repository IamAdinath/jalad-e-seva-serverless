import React from 'react';

// Import the dedicated CSS file for this component
import './UpdatesMarquee.css';

// Define the type for the props this component will accept
interface UpdatesMarqueeProps {
  updates: string[];
}

const UpdatesMarquee: React.FC<UpdatesMarqueeProps> = ({ updates }) => {
  // To create a seamless loop, we duplicate the content.
  // This way, when the first set of items scrolls off-screen,
  // the second identical set is already there to take its place.
  const marqueeContent = [...updates, ...updates];

  return (
    <div className="updates-marquee-container">
      <div className="updates-label">UPDATES</div>
      <div className="marquee-wrapper">
        <div className="marquee-content">
          {marqueeContent.map((update, index) => (
            <span className="update-item" key={index}>
              {update}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdatesMarquee;