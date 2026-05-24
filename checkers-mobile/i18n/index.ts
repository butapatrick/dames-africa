import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import fr from './locales/fr.json';
import en from './locales/en.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import sw from './locales/sw.json';
import ha from './locales/ha.json';
import es from './locales/es.json';

const LANGUAGE_KEY = '@dames_africa_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

/** Returns the device locale if we support it, otherwise 'fr'. */
function getDeviceLanguage(): string {
  const locale = Localization.getLocales()[0]?.languageCode ?? 'fr';
  return SUPPORTED_CODES.includes(locale) ? locale : 'fr';
}

export async function getSavedLanguage(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
}

export async function changeLanguage(code: string): Promise<void> {
  await i18n.changeLanguage(code);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
  } catch {}
  // RTL layout for Arabic (takes full effect after app restart on native)
  I18nManager.forceRTL(code === 'ar');
}

// Initialize synchronously so the first render already has translations.
// `initImmediate: false` makes i18next skip the async path when resources
// are provided inline — no Promise needed.
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    pt: { translation: pt },
    ar: { translation: ar },
    sw: { translation: sw },
    ha: { translation: ha },
    es: { translation: es },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  initImmediate: false,
});

export default i18n;
