import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "VP of Claims Operations",
      company: "Heartland Mutual Insurance",
      location: "Des Moines, IA",
      content: "Before ClarifyOps, our team spent 45 minutes per claim on manual data entry. Now we process claims in under 8 minutes with higher accuracy. The AI extraction catches details our adjusters used to miss — it's paid for itself within the first quarter.",
      rating: 5,
      avatar: "/images/testimonial-sarah.png"
    },
    {
      name: "James Kowalski",
      role: "Operations Director",
      company: "Prairie States TPA Group",
      location: "Omaha, NE",
      content: "We handle claims for 12 regional carriers across the Midwest. ClarifyOps' duplicate detection alone saved us from $380K in overpayments last year. The confidence scoring gives our reviewers clear priority — high confidence claims fly through, low confidence gets human eyes.",
      rating: 5,
      avatar: "/images/testimonial-james.png"
    },
    {
      name: "Dr. Maria Gonzalez",
      role: "Billing Administrator",
      company: "Lakewood Family Medical Center",
      location: "Springfield, MO",
      content: "As a small clinic, we were drowning in claim rejections and coding errors. ClarifyOps validates our CPT and ICD-10 codes before submission, cutting our rejection rate from 18% to under 3%. The medical chronology view is a lifesaver for complex patient histories.",
      rating: 5,
      avatar: "/images/testimonial-maria.png"
    }
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 mb-6">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            From adjusters who made the switch
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            "We got our afternoons back."
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Hear from claims teams who stopped drowning in paperwork and started focusing on the work that matters.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 relative shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.15)] transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center pt-4 border-t border-gray-100">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                  <div className="text-xs text-gray-400">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-400 text-sm mb-6">Trusted by adjusting firms and healthcare providers nationwide</p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
            <div className="text-lg font-semibold text-gray-300 tracking-wide">Heartland Mutual</div>
            <div className="text-lg font-semibold text-gray-300 tracking-wide">Prairie States TPA</div>
            <div className="text-lg font-semibold text-gray-300 tracking-wide">Lakewood Medical</div>
            <div className="text-lg font-semibold text-gray-300 tracking-wide">Great Plains Insurance</div>
            <div className="text-lg font-semibold text-gray-300 tracking-wide">Midwest Claims Co.</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
