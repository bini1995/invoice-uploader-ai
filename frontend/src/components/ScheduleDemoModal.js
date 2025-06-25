import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

export default function ScheduleDemoModal({ open, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  if (!open) return null;
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80 space-y-4"
      >
        {submitted ? (
          <>
            <h2 className="text-lg font-bold text-center">Thank you!</h2>
            <p className="text-sm text-center">We'll reach out soon to schedule your demo.</p>
            <Button className="w-full" onClick={onClose}>Close</Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-lg font-bold text-center">Request a Demo</h2>
            <input type="text" required placeholder="Name" className="input w-full text-sm" />
            <input type="email" required placeholder="Email" className="input w-full text-sm" />
            <input type="text" placeholder="Preferred Time" className="input w-full text-sm" />
            <Button type="submit" className="w-full">Submit</Button>
            <Button type="button" variant="secondary" className="w-full" onClick={onClose}>Cancel</Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
