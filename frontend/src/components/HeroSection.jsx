import React from 'react';
import { motion } from 'framer-motion';
import PartnerLogos from './PartnerLogos';
import { Button } from './ui/Button';

export default function HeroSection({ onRequestDemo }) {
  const variant = React.useMemo(() => (Math.random() < 0.5 ? 'A' : 'B'), []);
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
          {variant === 'A' ? (
            <>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
                Automate Invoices. Save Hours. Focus on Growth.
              </h1>
              <p className="text-xl md:text-2xl max-w-xl mx-auto md:mx-0 text-gray-600 dark:text-gray-300">
                Reduce manual work by 80% with AI-powered invoice processing. Upload once—AI handles the rest.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
                AI Invoice Workflows in Seconds
              </h1>
              <p className="text-xl md:text-2xl max-w-xl mx-auto md:mx-0 text-gray-600 dark:text-gray-300">
                Drag-and-drop invoices and let our AI categorize, summarize and notify your team automatically.
              </p>
            </>
          )}
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
            src="https://dummyimage.com/800x450/f3f4f6/1e40af.png&text=Invoice+Dashboard"
            alt="Product screenshot"
            className="w-full rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
