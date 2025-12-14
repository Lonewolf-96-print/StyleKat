// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation JSON files
import enTranslations from "../lib/en.json";
import hiTranslations from "../lib/hi.json";

// Define translation resources
const resources = {
  en: {
    common: enTranslations,
  },
  hi: {
    common: hiTranslations,
  },
};

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    debug: false,

    ns: ["common"], // namespaces
    defaultNS: "common",

    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
