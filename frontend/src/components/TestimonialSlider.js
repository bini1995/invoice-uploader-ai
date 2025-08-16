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

  const { quote, author, title, company, avatar } = testimonials[index];

  return (
    <div
      className="relative max-w-2xl mx-auto carousel-auto"
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
            className="text-center space-y-6"
          >
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
              <div className="flex items-center justify-center mb-6">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={author}
                    width="80"
                    height="80"
                    className="h-20 w-20 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">{author?.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <blockquote className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
                "{quote}"
              </blockquote>
              
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{author}</p>
                {title && <p className="text-sm text-gray-600">{title}</p>}
                {company && <p className="text-sm text-gray-500">{company}</p>}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {testimonials.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 p-2 flex items-center justify-center bg-white/90 rounded-full shadow-lg hover:bg-white focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 p-2 flex items-center justify-center bg-white/90 rounded-full shadow-lg hover:bg-white focus-visible:ring-2 focus-visible:ring-cta focus-visible:outline-none transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-accent' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
