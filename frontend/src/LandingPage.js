import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentArrowUpIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-indigo-700 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DocumentArrowUpIcon className="w-6 h-6" />
            <span className="font-bold text-lg">Invoice Uploader AI</span>
          </div>
          <Link
            to="/invoices"
            className="btn btn-primary bg-white text-indigo-700 hover:bg-gray-100"
          >
            Log In
          </Link>
        </div>
      </nav>
      <header className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 mt-10">Streamline Your Invoice Workflow</h1>
        <p className="text-lg mb-6 max-w-2xl">Upload, validate and analyze invoices with AI-powered tools.</p>
        <img
          src="https://source.unsplash.com/collection/190727/800x400"
          alt="Invoices Illustration"
          className="rounded shadow-lg mb-6 w-full max-w-3xl"
        />
        <Link to="/invoices" className="btn btn-primary text-lg px-8 py-3">Get Started</Link>
      </header>
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <div className="text-center">
            <CheckCircleIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold mt-2">Automatic Validation</h3>
            <p className="text-sm mt-1">Catch errors and duplicates before they hit your books.</p>
          </div>
          <div className="text-center">
            <ChartBarIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold mt-2">Real-Time Analytics</h3>
            <p className="text-sm mt-1">AI insights reveal spending trends and anomalies.</p>
          </div>
          <div className="text-center">
            <DocumentArrowUpIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold mt-2">One-Click Uploads</h3>
            <p className="text-sm mt-1">Import CSVs or PDFs and organize them instantly.</p>
          </div>
        </div>
      </section>
      <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900">
        © {new Date().getFullYear()} Invoice Uploader AI
      </footer>
    </div>
  );
}
