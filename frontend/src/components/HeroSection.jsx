import React from 'react';
import { motion } from 'framer-motion';
import { Link as ScrollLink } from 'react-scroll';
import HeroAnimation from './HeroAnimation';
import PartnerLogos from './PartnerLogos';
import { Button } from './ui/Button';

export default function HeroSection() {
  return (
    <section className="px-6 py-16 flex items-center justify-center">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold">
            AI-Powered Invoice Automation for Teams That Scale
          </h1>
          <p className="text-lg max-w-xl mx-auto md:mx-0">
            Reduce manual effort by 80% and integrate seamlessly into your workflow.
          </p>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 justify-center md:justify-start">
            <ScrollLink to="features" smooth duration={500} className="w-fit">
              <Button className="text-lg px-8 py-3">Learn More</Button>
            </ScrollLink>
            <Button asChild variant="secondary" className="text-lg px-8 py-3">
              <a href="/onboarding">Get Started</a>
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
