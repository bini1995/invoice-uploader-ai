import React from 'react';
import TestimonialSlider from './TestimonialSlider';

export default function Testimonial() {
  const testimonials = [
    {
      quote: 'ClarifyOps cut our claim review time in half while maintaining the oversight we need for compliance.',
      author: 'Sarah Chen',
      title: 'Director of Claims Operations',
      company: 'Regional Health System',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    },
    {
      quote: 'The AI extraction is remarkably accurate, and the audit trail gives us complete confidence in our process.',
      author: 'Michael Rodriguez',
      title: 'VP of Revenue Cycle',
      company: 'Multi-specialty Practice',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
    },
    {
      quote: 'We processed 30% more claims with the same staff while reducing errors by 40%.',
      author: 'Dr. Jennifer Park',
      title: 'Chief Medical Officer',
      company: 'TPA Organization',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
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

