import React from 'react';
import { motion } from 'framer-motion';
import PartnerLogos from './PartnerLogos';
import { Button } from './ui/Button';

export default function HeroSection({ onRequestDemo }) {
  return (
    <section
      id="product"
      className="relative overflow-hidden min-h-[70vh] px-6 py-20 flex items-center justify-center bg-white dark:bg-gray-900"
    >
      <img
        src="/logo512.png"
        alt="logo watermark"
        className="hidden md:block absolute right-10 bottom-0 w-1/2 max-w-md opacity-10 pointer-events-none select-none"
      />
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center md:text-left"
        >
          <>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
              Automate Claim Intake &amp; Extraction with AI
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl max-w-xl mx-auto md:mx-0 text-gray-600 dark:text-gray-300">
              Manual claim handling wastes time and invites errors. Our AI-driven extraction and fraud checks turn raw files into audit-ready data—helping you process claims faster and cut costs.
            </p>
          </>
          <div className="flex justify-center md:justify-start">
            <Button asChild className="text-lg px-8 py-3">
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
          <img
            src="https://dummyimage.com/800x450/f3f4f6/1e40af.png&text=Document+Dashboard"
            alt="Product screenshot"
            className="w-full rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
