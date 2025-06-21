import React from 'react';
import animation from '../checkmark.json';

let Lottie = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  Lottie = require('lottie-react').default;
}

export default function SuccessAnimation({ className = 'h-10 w-10' }) {
  if (!Lottie) return null;
  return <Lottie animationData={animation} loop={false} className={className} />;
}
