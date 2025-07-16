import React from 'react';
import animation from '../csv-summary.json';

let Lottie = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  Lottie = require('lottie-react').default;
}

export default function CsvSummaryAnimation({ className = 'w-full max-w-md mx-auto' }) {
  if (!Lottie) return null;
  return <Lottie animationData={animation} loop className={className} />;
}
