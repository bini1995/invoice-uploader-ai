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
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
              AI Claims Data Extractor
            </h1>
            <p className="text-xl md:text-2xl max-w-xl mx-auto md:mx-0 text-gray-600 dark:text-gray-300">
              Automate manual claims extraction with AI. Extract structured data from unstructured insurance claims in seconds.
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto md:mx-0">
              Built for insurance operations teams and claims processors who need fast, accurate data extraction without the manual work.
            </p>
          </>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button onClick={onRequestDemo} className="text-lg px-8 py-3">
              Request Demo
            </Button>
            <Button asChild variant="secondary" className="text-lg px-8 py-3">
              <a href="/free-trial">Start Free Trial</a>
            </Button>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No setup required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Process claims in seconds</span>
            </div>
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
            src="https://dummyimage.com/800x450/f3f4f6/1e40af.png&text=Claims+Extraction+Dashboard"
            alt="AI Claims Data Extraction Dashboard"
            className="w-full rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
