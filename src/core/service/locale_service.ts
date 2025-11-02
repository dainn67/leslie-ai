import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import en from "../../locales/en.json";
import vi from "../../locales/vi.json";
import { AsyncStorageService } from ".";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

const locales = RNLocalize.getLocales();
const deviceLanguage = locales[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export const loadLanguage = async () => {
  const language = await AsyncStorageService.getLanguage();
  i18n.changeLanguage(language);
};

export default i18n;
