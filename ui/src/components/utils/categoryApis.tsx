import type { Category } from './types';

// Static list of available category keys
export const CATEGORY_KEYS = [
  'ctgSchemes',
  'ctgJobs', 
  'ctgEducation',
  'ctgHealth',
  'ctgAgriculture',
  'ctgBusiness',
  'ctgTechnology',
  'ctgFinance',
  'ctgTransport',
  'ctgTourism',
  'ctgEnvironment',
  'ctgCulture',
  'ctgSports',
  'ctgScience',
  'ctgGovernment',
  'ctgNGOs',
  'ctgOthers'
];

/**
 * Get all available categories with their translation keys
 * This function returns the static list of categories that can be translated
 */
export function getAvailableCategories(): Category[] {
  return CATEGORY_KEYS.map(key => ({
    key,
    name: key // This will be translated in the component using useTranslation
  }));
}