import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

export default function DemoVideoEmbed({ 
  videoId, 
  title = "See Invoice Uploader AI in Action",
  description = "Watch how our AI processes hundreds of invoices in minutes, not hours",
  className = ""
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const handlePlay = () => {
    setIsPlaying(true);
    setShowOverlay(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Video Container */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {/* YouTube Embed */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            id="demo-video"
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setShowOverlay(true)}
          />
        </div>

        {/* Custom Overlay */}
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div className="text-center text-white p-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlay}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 mb-4 transition-colors duration-200"
              >
                <PlayIcon className="w-12 h-12" />
              </motion.button>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-lg opacity-90">{description}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Info */}
      <div className="mt-6 text-center">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Key Features Demonstrated
        </h4>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            AI Field Extraction
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            CSV Export
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Feedback Loop
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Fraud Detection
          </span>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="mb-4 opacity-90">
            Join thousands of companies saving 80% of their invoice processing time
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Usage example:
// <DemoVideoEmbed 
//   videoId="YOUR_YOUTUBE_VIDEO_ID"
//   title="Invoice Uploader AI Demo"
//   description="See how our AI processes documents in minutes"
// /> 