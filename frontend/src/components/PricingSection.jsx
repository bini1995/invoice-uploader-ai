import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$299",
      period: "/month",
      description: "Perfect for small insurance companies",
      features: [
        "Up to 1,000 claims/month",
        "AI-powered fraud detection",
        "Basic analytics dashboard",
        "Email support",
        "Standard security"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$899",
      period: "/month",
      description: "Ideal for growing insurance companies",
      features: [
        "Up to 10,000 claims/month",
        "Advanced AI fraud detection",
        "Real-time analytics",
        "Priority support",
        "SOC 2 compliance",
        "Custom workflows",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large insurance companies",
      features: [
        "Unlimited claims",
        "Custom AI models",
        "White-label solution",
        "Dedicated support",
        "On-premise deployment",
        "Custom integrations",
        "SLA guarantees",
        "Blockchain integration"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transparent, Enterprise-Grade Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No hidden fees, no surprises. Choose the plan that fits your needs and scale as you grow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500 bg-white shadow-2xl scale-105' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: plan.popular ? 1.05 : 1.02 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <StarIcon className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full py-3 font-semibold ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12 p-8 bg-white rounded-xl border border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose ClarifyOps Over Competitors?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Superior AI Technology</h4>
                <p className="text-gray-600 text-sm">Our AI is 40% more accurate than industry standard</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Faster Processing</h4>
                <p className="text-gray-600 text-sm">Process claims in under 1 day vs 2+ days industry average</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Better ROI</h4>
                <p className="text-gray-600 text-sm">Reduce claim costs by up to 40% with predictive analytics</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
