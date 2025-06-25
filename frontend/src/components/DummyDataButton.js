import React, { useState } from 'react';
import { API_BASE } from '../api';
import { useTranslation } from 'react-i18next';

export default function DummyDataButton() {
  const token = localStorage.getItem('token') || '';
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { t } = useTranslation();

  const handleSeed = async () => {
    setLoading(true);
    setDone(false);
    const res = await fetch(`${API_BASE}/api/invoices/seed-dummy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setDone(true);
    setLoading(false);
  };

  return (
    <button className="btn btn-secondary" onClick={handleSeed} disabled={loading}>
      {loading ? t('seeding') : done ? t('seeded') : t('seedDummyData')}
    </button>
  );
}
