import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from './components/PageHeader';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <PageHeader title="AI Claims Data Extractor / Dashboard" subtitle="404 - Page Not Found" />
      <p className="mb-4">The page you are looking for does not exist.</p>
      <Link to="/operations" className="text-indigo-600 underline">
        Go to Operations Dashboard
      </Link>
    </div>
  );
}
