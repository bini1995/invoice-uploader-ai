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
    anchor: '#ai-extraction',
    screenshot: 'https://cdn.example.com/feature-ai-extraction.webp',
  },
  {
    icon: CheckBadgeIcon,
    title: 'Automated Validation',
    description: 'CPT/HCPCS + NCCI checks with explainable flags.',
    anchor: '#automated-validation',
    screenshot: 'https://cdn.example.com/feature-validation.webp',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Audit & Oversight',
    description: 'Real-time status, notes, and immutable log trails.',
    anchor: '#audit-oversight',
    screenshot: 'https://cdn.example.com/feature-audit.webp',
  },
];

export default function FeatureCards() {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-surface scroll-mt-24 motion-safe:animate-fade-in"
    >
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description, anchor, screenshot }) => (
          <div
            key={title}
            className="text-center space-y-2 flex flex-col items-center h-full group"
          >
            <Icon
              className="w-10 h-10 mx-auto text-accent transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
            <img
              src={screenshot}
              alt=""
              width="200"
              height="120"
              loading="lazy"
              decoding="async"
              className="mt-4 rounded shadow-sm"
            />
            <a
              href={anchor}
              className="text-sm text-accent underline mt-2"
            >
              Learn more
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

