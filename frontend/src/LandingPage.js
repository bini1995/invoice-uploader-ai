import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import heroAnimation from './invoice-hero.json';
import {
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import LanguageSelector from './components/LanguageSelector';
import DarkModeToggle from './components/DarkModeToggle';
import Carousel from './components/Carousel';
import { Card } from './components/ui/Card';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-indigo-700 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DocumentArrowUpIcon className="w-6 h-6" />
            <span className="font-bold text-lg">Invoice Uploader AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <DarkModeToggle />
            <Link
              to="/invoices"
              className="btn btn-primary bg-white text-indigo-700 hover:bg-gray-100"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>
      <header className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold">Streamline Accounts Payable with AI</h1>
            <p className="text-lg max-w-xl mx-auto md:mx-0">
              Upload invoices, validate details and uncover insights—all in one intuitive platform.
            </p>
            <Link to="/invoices" className="btn btn-primary text-lg px-8 py-3">Try Invoice Uploader AI → Get Started</Link>
            <div className="flex justify-center md:justify-start items-center gap-4 pt-4 opacity-80">
              <img src="https://dummyimage.com/120x60/000/fff.png&text=Client+1" alt="Client 1" className="h-8 object-contain" />
              <img src="https://dummyimage.com/120x60/000/fff.png&text=Client+2" alt="Client 2" className="h-8 object-contain" />
              <img src="https://dummyimage.com/120x60/000/fff.png&text=Client+3" alt="Client 3" className="h-8 object-contain" />
              <img src="https://dummyimage.com/120x60/000/fff.png&text=Client+4" alt="Client 4" className="h-8 object-contain" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <Lottie animationData={heroAnimation} loop className="w-full max-w-md mx-auto" />
          </motion.div>
        </div>
      </header>
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center space-y-2">
              <CheckCircleIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="font-semibold">Automatic Validation</h3>
              <p className="text-sm">Catch errors and duplicates before they hit your books.</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="text-center space-y-2">
              <ChartBarIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="font-semibold">Real-Time Analytics</h3>
              <p className="text-sm">AI insights reveal spending trends and anomalies.</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="text-center space-y-2">
              <DocumentArrowUpIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="font-semibold">One-Click Uploads</h3>
              <p className="text-sm">Import CSVs or PDFs and organize them instantly.</p>
            </Card>
          </motion.div>
        </div>
      </section>
      <section className="py-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-8"
        >
          What People Are Saying
        </motion.h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6 mb-8">
          <Card className="space-y-2">
            <p className="text-sm">"This app cut our invoice processing time in half."</p>
            <span className="text-xs text-gray-500">- Sarah, Finance Lead</span>
          </Card>
          <Card className="space-y-2">
            <p className="text-sm">"The AI insights are incredibly helpful for spotting issues."</p>
            <span className="text-xs text-gray-500">- Mark, CFO</span>
          </Card>
          <Card className="space-y-2">
            <p className="text-sm">"Simple, fast, and effective. Our team loves it."</p>
            <span className="text-xs text-gray-500">- Priya, Operations Manager</span>
          </Card>
        </div>
        <Carousel
          images={[
            'https://source.unsplash.com/collection/190727/800x401',
            'https://source.unsplash.com/collection/190727/800x402',
            'https://source.unsplash.com/collection/190727/800x403',
          ]}
        />
      </section>
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Pricing</h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="text-4xl font-bold">$0</p>
            <p className="text-sm">All core features for small teams.</p>
            <Link to="/invoices" className="btn btn-primary">Get Started</Link>
          </Card>
          <Card className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Pro</h3>
            <p className="text-4xl font-bold">$49</p>
            <p className="text-sm">Advanced analytics and priority support.</p>
            <Link to="/invoices" className="btn btn-primary">Start Free Trial</Link>
          </Card>
          <Card className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="text-4xl font-bold">Contact us</p>
            <p className="text-sm">Custom integrations and onboarding.</p>
            <Link to="/invoices" className="btn btn-primary">Contact Sales</Link>
          </Card>
        </div>
      </section>
      <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900">
        © {new Date().getFullYear()} Invoice Uploader AI
      </footer>
    </div>
  );
}
