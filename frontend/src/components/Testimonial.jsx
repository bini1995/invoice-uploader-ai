import React from 'react';
import TestimonialSlider from './TestimonialSlider';

export default function Testimonial() {
  const testimonials = [
    {
      quote: 'ClarifyOps cut our claim review time in half while maintaining the oversight we need for compliance.',
      author: 'Sarah Chen',
      title: 'Director of Claims Operations',
      company: 'Regional Health System',
      avatar: '/testimonial-1.jpg',
    },
    {
      quote: 'The AI extraction is remarkably accurate, and the audit trail gives us complete confidence in our process.',
      author: 'Michael Rodriguez',
      title: 'VP of Revenue Cycle',
      company: 'Multi-specialty Practice',
      avatar: '/testimonial-2.jpg',
    },
    {
      quote: 'We processed 30% more claims with the same staff while reducing errors by 40%.',
      author: 'Dr. Jennifer Park',
      title: 'Chief Medical Officer',
      company: 'TPA Organization',
      avatar: '/testimonial-3.jpg',
    },
  ];

  return (
    <section className="py-16 bg-gray-50 motion-safe:animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What our customers say</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Real results from healthcare organizations using ClarifyOps
          </p>
        </div>
        <TestimonialSlider testimonials={testimonials} interval={6000} />
      </div>
    </section>
  );
}

