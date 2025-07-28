import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from './ui/Card';

export default function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps = [
    { title: 'Upload Claims', desc: 'Upload PDFs, images, or scanned claim documents.' },
    { title: 'AI Extraction', desc: 'AI extracts structured data with 95%+ accuracy.' },
    { title: 'Fraud Check', desc: 'Built-in fraud detection flags suspicious patterns.' },
    { title: 'Export Data', desc: 'Export clean data to your claims management system.' },
  ];

  return (
    <section id="how-it-works" className="py-12" ref={ref}>
      <h2 className="text-3xl font-bold text-center mb-8">How Claims Processing Works</h2>
      <div className="container mx-auto grid md:grid-cols-4 gap-6 px-6">
        {steps.map((step) => (
          <motion.div key={step.title} style={{ opacity }}>
            <Card className="text-center space-y-2 p-4 rounded-xl">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm">{step.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
