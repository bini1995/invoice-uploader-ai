import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function SplitScreenStory() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center px-6">
        <motion.img
          src="https://dummyimage.com/600x400/000/fff.png&text=CSV+Upload"
          alt="CSV upload"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full rounded shadow-lg"
        />
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold">CSV → AI Summary</h2>
          <p className="text-lg">
            Upload your invoice CSV and instantly receive an AI-generated summary highlighting
            key errors, trends and insights.
          </p>
          <Link to="/sandbox" className="btn btn-primary inline-block">
            Try the Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
