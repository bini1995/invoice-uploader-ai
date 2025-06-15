import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { "title": "Invoice Uploader AI" } },
  es: { translation: { "title": "Cargador de Facturas AI" } },
  fr: { translation: { "title": "Téléverseur de Factures AI" } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
