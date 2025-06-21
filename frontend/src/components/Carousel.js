import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Carousel({ images = [] }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;
  const prev = () => setIndex((index - 1 + images.length) % images.length);
  const next = () => setIndex((index + 1) % images.length);
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <img src={images[index]} alt="Screenshot" className="w-full rounded-lg shadow-lg" />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-700/80 p-1 rounded-full hover:bg-white dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-700/80 p-1 rounded-full hover:bg-white dark:hover:bg-gray-700"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
          </button>
        </>
      )}
    </div>
  );
}
