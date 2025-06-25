import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestimonialSlider({ testimonials = [], interval = 5000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, interval);
    return () => clearInterval(id);
  }, [testimonials.length, interval]);

  const prev = () => setIndex((index - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((index + 1) % testimonials.length);

  if (testimonials.length === 0) return null;

  const { quote, author } = testimonials[index];

  return (
    <div className="relative max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <p className="text-lg font-medium">"{quote}"</p>
          {author && <p className="text-sm text-gray-500">- {author}</p>}
        </motion.div>
      </AnimatePresence>
      {testimonials.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-1 bg-white/80 dark:bg-gray-700/80 rounded-full hover:bg-white dark:hover:bg-gray-700"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-white/80 dark:bg-gray-700/80 rounded-full hover:bg-white dark:hover:bg-gray-700"
            aria-label="Next"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
