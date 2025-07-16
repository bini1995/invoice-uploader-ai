import React from 'react';
import PartnerLogos from './PartnerLogos';
import TestimonialSlider from './TestimonialSlider';

export default function SocialProofSection() {
  const testimonials = [
    {
      quote: 'Saved our team 40+ hours weekly',
      author: 'Alex',
      company: 'Globex',
      image: 'https://i.pravatar.cc/100?img=7',
    },
    {
      quote: 'A must-have for finance automation',
      author: 'Jamie',
      company: 'Initech',
      image: 'https://i.pravatar.cc/100?img=8',
    },
    {
      quote: 'Intuitive and incredibly fast',
      author: 'Taylor',
      company: 'Contoso',
      image: 'https://i.pravatar.cc/100?img=9',
    },
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
