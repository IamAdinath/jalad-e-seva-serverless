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
            <h1>Available Categories</h1>
            <div className="header-actions">
              <select 
                value={i18n.language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-selector"
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          </div>

          <div className="categories-info">
            <p>
              Categories are managed through translation files. To add or modify categories, 
              update the translation files in <code>ui/public/locales/</code>.
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
                    <strong>Translation Key:</strong> {category.key}
                  </p>
                  <p className="category-usage">
                    Use this key in blog posts to categorize content.
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