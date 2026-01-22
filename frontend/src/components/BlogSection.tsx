import React from 'react';
import { Card } from './ui/Card';

export default function BlogSection() {
  const posts = [
    {
      title: 'Why AI in Invoicing is the Future',
      description: 'Explore how automation and machine learning are changing finance ops.'
    },
    {
      title: 'How to Reduce Errors in Finance Ops',
      description: 'Practical tips to minimize mistakes and speed up month‑end close.'
    },
    {
      title: 'Choosing the Right AP Automation Tool',
      description: 'Key factors to evaluate when selecting software for your team.'
    }
  ];
  return (
    <section id="blog" className="py-12 bg-gray-50 dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center mb-8">Blog & Resources</h2>
      <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
        {posts.map((post, idx) => (
          <Card key={idx} className="space-y-2 text-center p-6">
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-sm">{post.description}</p>
            <button className="btn btn-primary text-sm mt-2">Read More</button>
          </Card>
        ))}
      </div>
    </section>
  );
}
