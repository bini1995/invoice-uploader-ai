import React from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  HomeIcon,
  HeartIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { Card } from './ui/Card';

export default function ScrollingUseCases() {
  const cases = [
    { icon: TruckIcon, title: 'Auto Claims', desc: 'Process vehicle damage claims instantly.' },
    { icon: HomeIcon, title: 'Property Claims', desc: 'Extract data from property damage reports.' },
    { icon: HeartIcon, title: 'Health Claims', desc: 'Process medical and health insurance claims.' },
    { icon: ShieldExclamationIcon, title: 'Fraud Detection', desc: 'Identify suspicious claims patterns.' },
    { icon: UserGroupIcon, title: 'Claims Teams', desc: 'Collaborate on complex claims processing.' },
    { icon: BoltIcon, title: 'Automation', desc: 'Eliminate manual claims data entry.' },
  ];
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Insurance Use Cases</h2>
      <div className="overflow-x-auto pb-4 px-6">
        <div className="flex space-x-6 w-max snap-x snap-mandatory">
          {cases.map(({ icon: Icon, title, desc }, idx) => (
            <motion.div
              key={title}
              className="snap-center shrink-0 w-64"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="text-center space-y-2">
                <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm">{desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
