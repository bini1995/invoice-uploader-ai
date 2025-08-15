import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function TestimonialSlider({ testimonials = [], interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [userPaused, setUserPaused] = useState(prefersReducedMotion);
  const [isPaused, setIsPaused] = useState(prefersReducedMotion);

  useEffect(() => {
    setIsPaused(userPaused);
  }, [userPaused]);

  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % testimonials.length);
    }, interval);
    return () => clearInterval(id);
  }, [testimonials.length, interval, isPaused]);

  const prev = () => setIndex((index - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((index + 1) % testimonials.length);
  const togglePause = () => setUserPaused(p => !p);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(userPaused);
  const handleFocus = () => setIsPaused(true);
  const handleBlur = () => setIsPaused(userPaused);

  if (testimonials.length === 0) return null;

  const { quote, author, image, company, highlight } = testimonials[index];

  return (
    <div
      className="relative max-w-xl mx-auto carousel-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-3"
          >
            {image && (
              <img
                src={image}
                alt={author}
                width="48"
                height="48"
                className="mx-auto h-12 w-12 rounded-full object-cover"
              />
            )}
            <p
              className={
                highlight ? 'text-2xl font-bold' : 'text-lg font-medium'
              }
            >
              "{quote}"
            </p>
            {author && (
              <p className="text-sm text-gray-500">
                - {author}
                {company ? `, ${company}` : ''}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {testimonials.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 p-2 flex items-center justify-center bg-white/80 dark:bg-gray-700/80 rounded-full hover:bg-white dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 p-2 flex items-center justify-center bg-white/80 dark:bg-gray-700/80 rounded-full hover:bg-white dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          <button
            aria-pressed={isPaused}
            onClick={togglePause}
            className="absolute bottom-0 right-0 w-11 h-11 p-2 flex items-center justify-center bg-white/80 dark:bg-gray-700/80 rounded-full hover:bg-white dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none"
          >
            {isPaused ? 'Play' : 'Pause'}
          </button>
        </>
      )}
    </div>
  );
}
