import React from 'react';
import animation from '../invoice-hero.json';

let Lottie = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  Lottie = require('lottie-react').default;
}

export default function HeroAnimation({ className = 'w-full max-w-md mx-auto' }) {
  if (!Lottie) return null;
  return <Lottie animationData={animation} loop className={className} />;
}
