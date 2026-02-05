import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  DocumentCheckIcon,
  ServerStackIcon,
  EyeSlashIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const badges = [
  {
    icon: ShieldCheckIcon,
    title: 'HIPAA Committed',
    description: 'Infrastructure and practices designed for HIPAA compliance with BAA available on request',
    status: 'Committed',
    color: 'emerald'
  },
  {
    icon: LockClosedIcon,
    title: 'SOC 2 Type II',
    description: 'Working toward SOC 2 certification with controls for security, availability, and confidentiality',
    status: 'In Progress',
    color: 'blue'
  },
  {
    icon: DocumentCheckIcon,
    title: 'Audit Logging',
    description: 'Activity logging for document actions, user interactions, and system events',
    status: 'Built-in',
    color: 'purple'
  },
  {
    icon: ServerStackIcon,
    title: 'Data Encryption',
    description: 'AES-256 encryption for sensitive data fields and TLS in transit for all connections',
    status: 'Enabled',
    color: 'indigo'
  },
  {
    icon: EyeSlashIcon,
    title: 'PHI Detection',
    description: 'Automated detection of protected health information patterns in claim documents',
    status: 'Active',
    color: 'orange'
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'GDPR Aware',
    description: 'Designing for European data protection standards including right to deletion',
    status: 'In Progress',
    color: 'teal'
  }
];

const colorClasses = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  teal: 'bg-teal-50 border-teal-200 text-teal-700'
};

const iconColorClasses = {
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  indigo: 'text-indigo-600',
  orange: 'text-orange-600',
  teal: 'text-teal-600'
};

export default function ComplianceBadges() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50" id="compliance">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 mb-6">
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Enterprise Security & Compliance
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Built for Enterprise Trust
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ClarifyOps meets the strictest security and compliance requirements for healthcare and insurance data processing
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[badge.color]}`}>
                  <badge.icon className={`h-6 w-6 ${iconColorClasses[badge.color]}`} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[badge.color]}`}>
                  {badge.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{badge.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{badge.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
            <div className="flex items-center gap-2 text-white/80">
              <ShieldCheckIcon className="h-6 w-6 text-emerald-400" />
              <span className="font-medium">HIPAA Committed</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <LockClosedIcon className="h-6 w-6 text-blue-400" />
              <span className="font-medium">SOC 2 In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <DocumentCheckIcon className="h-6 w-6 text-purple-400" />
              <span className="font-medium">GDPR Aware</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <ServerStackIcon className="h-6 w-6 text-indigo-400" />
              <span className="font-medium">TLS Encrypted</span>
            </div>
          </div>
          <p className="text-white/60 text-sm max-w-2xl mx-auto">
            We are actively building toward formal certifications. 
            Request our security documentation and compliance roadmap during your evaluation.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
