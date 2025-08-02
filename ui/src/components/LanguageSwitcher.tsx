import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

// UPDATE THIS ARRAY
const languages = [
  { code: 'en', name: 'English' },
  { code: 'mr', name: 'मराठी' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      {languages.map((lng) => (
        <button
          key={lng.code}
          onClick={() => changeLanguage(lng.code)}
          className={i18n.resolvedLanguage === lng.code ? 'active' : ''}
        >
          {lng.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;