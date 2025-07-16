import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessAnimation from './SuccessAnimation';

export default function CsvUploadFlowDemo() {
  const steps = [
    {
      title: 'Drag & Drop CSV',
      img: 'https://dummyimage.com/800x450/6366f1/ffffff.png&text=Drag+%26+Drop+CSV'
    },
    {
      title: 'Preview & Fix Issues',
      img: 'https://dummyimage.com/800x450/4f46e5/ffffff.png&text=Preview+Rows'
    },
    {
      title: 'Dashboard Demo',
      img: 'https://dummyimage.com/800x450/1e40af/ffffff.gif&text=Dashboard+Video'
    }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % steps.length);
    }, 2500);
    return () => clearInterval(id);
  }, [steps.length]);

  const { title, img } = steps[index];

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <img src={img} alt={title} className="w-full rounded-lg shadow-lg" />
          <p className="text-center font-medium">{title}</p>
        </motion.div>
      </AnimatePresence>
      {index === steps.length - 1 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <SuccessAnimation className="w-20 h-20" />
        </div>
      )}
    </div>
  );
}
