import React from 'react';

const features = [
  {
    title: 'AI Extraction',
    description: 'CMS-1500 / UB-04 captured with confidence.',
    anchor: '#ai-extraction',
    screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
  },
  {
    title: 'Automated Checks',
    description: 'CPT/HCPCS + NCCI validations with explainable flags.',
    anchor: '#automated-validation',
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4',
  },
  {
    title: 'Audit & Oversight',
    description: 'Status, notes, and immutable log trails.',
    anchor: '#audit-oversight',
    screenshot: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_5mb.mp4',
  },
];

export default function FeatureCards() {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-surface scroll-mt-24 motion-safe:animate-fade-in"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Three powerful features that transform your claims processing workflow
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ title, description, anchor, screenshot, video }) => (
            <div
              key={title}
              className="text-center space-y-4 flex flex-col items-center h-full group"
            >
              <div className="relative w-full max-w-sm">
                <img
                  src={screenshot}
                  alt={`${title} feature screenshot`}
                  width="320"
                  height="200"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto rounded-lg shadow-lg border border-gray-200 group-hover:shadow-xl transition-shadow duration-300"
                />
                {video && (
                  <video
                    src={video}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-sm text-muted max-w-xs">{description}</p>
              </div>
              <a
                href={anchor}
                className="text-sm text-accent underline mt-auto hover:text-accent-dark transition-colors"
              >
                How it works
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

