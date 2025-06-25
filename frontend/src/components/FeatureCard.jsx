import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';

export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card className="text-center space-y-2">
        {Icon && <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />}
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm">{description}</p>
      </Card>
    </motion.div>
  );
}
