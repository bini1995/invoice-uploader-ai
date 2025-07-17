import React from 'react';
import PartnerLogos from './PartnerLogos';
import TestimonialSlider from './TestimonialSlider';

export default function TrustSection() {
  const testimonials = [
    {
      quote: 'Used by finance teams around the globe.',
      author: 'Pat',
      company: 'Switchly',
      image: 'https://i.pravatar.cc/100?img=25',
    },
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto space-y-6 px-6 text-center">
        <h3 className="text-xl font-bold">Trusted by 300+ finance teams</h3>
        <div className="text-yellow-500">★★★★★</div>
        <PartnerLogos />
        <TestimonialSlider testimonials={testimonials} />
      </div>
    </section>
  );
}
