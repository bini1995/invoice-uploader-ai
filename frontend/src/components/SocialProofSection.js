import React from 'react';
import PartnerLogos from './PartnerLogos';
import TestimonialSlider from './TestimonialSlider';

export default function SocialProofSection() {
  const testimonials = [
    { quote: 'Saved our team 40+ hours weekly', author: 'Alex, Ops Lead' },
    { quote: 'A must-have for finance automation', author: 'Jamie, CFO' },
    { quote: 'Intuitive and incredibly fast', author: 'Taylor, Controller' },
  ];
  return (
    <section className="py-12">
      <div className="container mx-auto space-y-8 px-6">
        <PartnerLogos />
        <TestimonialSlider testimonials={testimonials} />
      </div>
    </section>
  );
}
