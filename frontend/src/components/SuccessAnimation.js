import React from 'react';
import animation from '../checkmark.json';

let Lottie = null;
if (typeof window !== 'undefined' && import.meta.env.MODE !== 'test') {
  Lottie = require('lottie-react').default;
}

export default function SuccessAnimation({ className = 'h-10 w-10' }) {
  if (!Lottie) return null;
  return <Lottie animationData={animation} loop={false} className={className} />;
}
