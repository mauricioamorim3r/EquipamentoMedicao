import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get language from localStorage, default to Portuguese
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('sgm-language') as Language;
      return savedLanguage && translations[savedLanguage] ? savedLanguage : 'pt-BR';
    }
    return 'pt-BR';
  });

  // Save language preference to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sgm-language', newLanguage);
    }
  };

  // Translation function
  const t = (key: TranslationKey): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      // Fallback to Portuguese if translation is missing
      return translations['pt-BR'][key] || key;
    }
    return translation;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Utility hook for just translation function
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};