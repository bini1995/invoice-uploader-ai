import React from 'react';
import { motion } from 'framer-motion';
import HeroAnimation from './HeroAnimation';
import PartnerLogos from './PartnerLogos';
import { Button } from './ui/Button';

export default function HeroSection({ onRequestDemo }) {
  return (
    <section id="product" className="px-6 py-16 flex items-center justify-center">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold">
            ClarifyOps – AI Invoice Automation for Growing Teams
          </h1>
          <p className="text-lg max-w-xl mx-auto md:mx-0">
            Reduce manual effort by 80% and integrate seamlessly into your workflow.
          </p>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 justify-center md:justify-start">
            <Button className="text-lg px-8 py-3" onClick={onRequestDemo}>Request Demo</Button>
            <Button asChild variant="secondary" className="text-lg px-8 py-3">
              <a href="/free-trial">Start Free Trial</a>
            </Button>
          </div>
          <PartnerLogos />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <HeroAnimation />
        </motion.div>
      </div>
    </section>
  );
}
