import React from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableCategories } from './utils/categoryApis';
import type { Category } from './utils/types';

interface CategoryDropdownProps {
  value?: string;
  onChange: (categoryKey: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}) => {
  const { t } = useTranslation();
  const categories = getAvailableCategories();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      required={required}
      className={`category-dropdown ${className}`}
    >
      <option value="">
        {placeholder || t('writerCategorySelect')}
      </option>
      {categories.map((category: Category) => (
        <option key={category.key} value={category.key}>
          {t(category.key)}
        </option>
      ))}
    </select>
  );
};

export default CategoryDropdown;