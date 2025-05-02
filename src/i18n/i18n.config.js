import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../translations/en.json';
import fr from '../translations/fr.json';
import ar from '../translations/ar.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  };

const LANGUAGE_PERSISTENCE_KEY = 'user-language';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback) => {
        try {
            const storedLanguage = await AsyncStorage.getItem(LANGUAGE_PERSISTENCE_KEY);
            if (storedLanguage) {
              console.log('LanguageDetector: Found stored language:', storedLanguage);
              callback(storedLanguage);
            } else {
              console.log('LanguageDetector: No stored language found, using fallback: en');
              // Optional: Detect device language here if needed as a fallback
              callback('en'); // Default to English if nothing stored
            }
        }catch (error) {
            console.error('LanguageDetector: Error reading language from AsyncStorage:', error);
            callback('en'); // Fallback on error
        }
    },
    init: () => {},
    cacheUserLanguage: async (language) => {
    try {
      console.log('LanguageDetector: Caching language:', language);
      await AsyncStorage.setItem(LANGUAGE_PERSISTENCE_KEY, language);
    } catch (error) {
      console.error('LanguageDetector: Error saving language to AsyncStorage:', error);
    }
  },
};
i18n
  .use(languageDetector) // Use the custom detector
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    compatibilityJSON: 'v3', // Recommended for react-native
    // lng: 'en', // Default language - let detector handle this
    fallbackLng: 'en', // Use English if selected language is unavailable
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    react: {
      useSuspense: false, // Set to false for React Native
    }
  });

export default i18n;