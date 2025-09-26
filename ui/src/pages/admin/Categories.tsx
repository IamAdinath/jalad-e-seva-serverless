import React from "react";
import { useTranslation } from 'react-i18next';
import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";
import { getAvailableCategories } from "../../components/utils/categoryApis";
import type { Category } from "../../components/utils/types";
import './Categories.css';

const Categories: React.FC = () => {
  const { t, i18n } = useTranslation();
  const categories = getAvailableCategories();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <>
      <AdminHeader />
      <div className="admin-categories">
        <div className="container">
          <div className="categories-header">
            <h1>{t('adminCategoriesTitle')}</h1>
            <div className="header-actions">
              <select 
                value={i18n.language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-selector"
              >
                <option value="en">{t('adminLanguageEnglish')}</option>
                <option value="mr">{t('adminLanguageMarathi')}</option>
              </select>
            </div>
          </div>

          <div className="categories-info">
            <p>
              {t('adminCategoriesDescription')} <code>ui/public/locales/</code>.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((category: Category) => (
              <div key={category.key} className="category-card">
                <div className="category-header">
                  <h3>{t(category.key)}</h3>
                </div>
                
                <div className="category-content">
                  <p className="category-key">
                    <strong>{t('adminCategoryKey')}:</strong> {category.key}
                  </p>
                  <p className="category-usage">
                    {t('adminCategoryUsage')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Categories;