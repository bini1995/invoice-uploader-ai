import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import ProgressBar from './ProgressBar';
import checkmark from '../checkmark.json';
import { useTranslation } from 'react-i18next';

export default function DemoUploadModal({ open, onClose }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    setProgress(0);
    setDone(false);
    const steps = [30, 60, 100];
    const timers = steps.map((val, idx) =>
      setTimeout(() => {
        setProgress(val);
        if (idx === steps.length - 1) setDone(true);
      }, (idx + 1) * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80 space-y-4"
      >
        <h2 className="text-lg font-bold text-center">{t('demoUpload')}</h2>
        <div className="relative">
          <img
            src="https://dummyimage.com/400x250/cccccc/000&text=Sample+Invoice"
            alt="Sample Invoice"
            className="w-full rounded shadow"
          />
          <div className="absolute top-0 right-0 bottom-0 w-1/3 backdrop-blur-sm" />
        </div>
        {done ? (
          <div className="flex flex-col items-center space-y-2">
            <Lottie animationData={checkmark} style={{ width: 80, height: 80 }} loop={false} />
            <p className="text-sm">{t('invoiceParsed')}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-center">{t('parsingInvoice')}</p>
            <ProgressBar value={progress} />
          </>
        )}
        <button onClick={onClose} className="btn btn-primary w-full" title={t('close') + ' demo'}>
          {t('close')}
        </button>
      </motion.div>
    </div>
  );
}
