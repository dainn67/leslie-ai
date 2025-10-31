import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import en from "./en.json";
import vi from "./vi.json";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

// Detect device language
const locales = RNLocalize.getLocales();
const defaultLang = locales[0]?.languageCode ?? "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources,
  lng: defaultLang, // initial language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
