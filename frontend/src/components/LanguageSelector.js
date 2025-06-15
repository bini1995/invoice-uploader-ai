import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const change = (e) => i18n.changeLanguage(e.target.value);
  return (
    <select onChange={change} value={i18n.language} className="border rounded px-1 text-sm">
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
    </select>
  );
}
