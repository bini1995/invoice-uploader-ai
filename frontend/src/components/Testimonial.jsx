import React from 'react';
import TestimonialSlider from './TestimonialSlider';

export default function Testimonial() {
  const testimonials = [
    {
      quote: 'ClarifyOps cut our claim review time in half without losing oversight.',
      author: 'Pilot customer',
    },
    {
      quote: 'We processed 30% more claims with the same staff.',
      author: 'Early adopter',
    },
    {
      quote: 'The audit trail gives us peace of mind.',
      author: 'Compliance lead',
    },
  ];

  return (
    <section className="py-16 bg-surface motion-safe:animate-fade-in">
      <TestimonialSlider testimonials={testimonials} interval={6000} />
    </section>
  );
}

