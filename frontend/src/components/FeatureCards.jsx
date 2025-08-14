import React from 'react';
import {
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ClipboardDocumentListIcon,
    title: 'AI Extraction',
    description: 'CMS-1500 & UB-04 fields captured with confidence.',
  },
  {
    icon: CheckBadgeIcon,
    title: 'Automated Checks',
    description: 'CPT/HCPCS + NCCI validations with explainable flags.',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Oversight & Audit',
    description: 'Real-time status, notes, and immutable log trails.',
  },
];

export default function FeatureCards() {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-surface scroll-mt-24 motion-safe:animate-fade-in"
    >
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="text-center space-y-2 flex flex-col items-center h-full"
          >
            <Icon className="w-10 h-10 mx-auto text-accent" aria-hidden="true" />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

