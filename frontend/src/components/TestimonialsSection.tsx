import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "VP of Claims",
      company: "Liberty Mutual",
      content: "ClarifyOps has transformed our claims processing. We've reduced processing time by 60% and improved accuracy by 40%. The AI fraud detection alone has saved us millions.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      company: "State Farm",
      content: "The platform's predictive analytics have given us unprecedented insights into claim patterns. We've reduced costs by 35% while improving customer satisfaction scores.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Claims Director",
      company: "Allstate",
      content: "ClarifyOps' blockchain integration provides complete transparency. Our policyholders love the real-time updates, and our fraud detection is now 99.7% accurate.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const stats = [
    { value: "60%", label: "Faster Processing" },
    { value: "40%", label: "Cost Reduction" },
    { value: "99.7%", label: "Fraud Detection Accuracy" },
    { value: "95+", label: "NPS Score" }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Leading Insurance Companies
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how ClarifyOps is revolutionizing claims processing for the world's largest insurers.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid md:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-200 absolute top-4 right-4" />
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-600 mb-8">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Liberty Mutual</div>
            <div className="text-2xl font-bold text-gray-400">State Farm</div>
            <div className="text-2xl font-bold text-gray-400">Allstate</div>
            <div className="text-2xl font-bold text-gray-400">Progressive</div>
            <div className="text-2xl font-bold text-gray-400">GEICO</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 