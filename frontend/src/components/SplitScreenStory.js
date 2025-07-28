import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CsvSummaryAnimation from './CsvSummaryAnimation';

export default function SplitScreenStory() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center px-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <CsvSummaryAnimation className="w-full max-w-md mx-auto" />
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold">Claims → Structured Data</h2>
          <p className="text-lg">
            Upload insurance claim documents and instantly receive structured data with fraud detection,
            accuracy scores, and ready-to-export information.
          </p>
          <Link to="/sandbox" className="btn btn-primary inline-block">
            Try Claims Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
