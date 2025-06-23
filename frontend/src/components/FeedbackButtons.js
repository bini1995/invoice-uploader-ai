import React, { useState } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { API_BASE } from '../api';

export default function FeedbackButtons({ endpoint }) {
  const [rating, setRating] = useState(0);

  const send = async (value) => {
    setRating(value);
    try {
      await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, rating: value }),
      });
    } catch (e) {
      console.error('Feedback failed:', e);
    }
  };

  return (
    <div className="flex space-x-1 mt-1">
      <button
        onClick={() => send(1)}
        className={`p-1 rounded ${rating === 1 ? 'bg-green-200 dark:bg-green-700' : ''}`}
        aria-label="Thumbs up"
      >
        <HandThumbUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => send(-1)}
        className={`p-1 rounded ${rating === -1 ? 'bg-red-200 dark:bg-red-700' : ''}`}
        aria-label="Thumbs down"
      >
        <HandThumbDownIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
