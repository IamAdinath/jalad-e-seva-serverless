import React from 'react';
import { useTranslation } from 'react-i18next';

// Import the dedicated CSS file
import './LanguageSwitcher.css';

// This array can now be easily extended with more languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'mr', name: 'मराठी' },
  // Example: Add more languages here in the future
  // { code: 'hi', name: 'हिन्दी' },
  // { code: 'gu', name: 'ગુજરાતી' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  // This function is called when the user selects a new option from the dropdown
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="language-switcher">
      {/* 
        The select element's value is controlled by the current language in i18next.
        This ensures it always shows the correct selection.
      */}
      <select 
        value={i18n.resolvedLanguage} 
        onChange={handleLanguageChange}
        className="language-select"
      >
        {/* We map over the languages array to create an <option> for each one */}
        {languages.map((lng) => (
          <option key={lng.code} value={lng.code}>
            {lng.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;