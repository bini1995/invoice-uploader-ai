import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import heroAnimation from './invoice-hero.json';
import {
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  AtSymbolIcon,
  BriefcaseIcon,
  CodeBracketSquareIcon,
  EnvelopeIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  ScaleIcon,
  BoltIcon,
  TagIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  ArrowLongRightIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import LanguageSelector from './components/LanguageSelector';
import DarkModeToggle from './components/DarkModeToggle';
import Carousel from './components/Carousel';
import { Card } from './components/ui/Card';
import DemoUploadModal from './components/DemoUploadModal';
import ProgressDashboard from './components/ProgressDashboard';
import AiSearchDemo from './components/AiSearchDemo';
import DummyDataButton from './components/DummyDataButton';

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-indigo-100 to-indigo-200 dark:from-purple-900 dark:via-indigo-900 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-indigo-700 text-white p-4 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DocumentArrowUpIcon className="w-6 h-6" />
            <span className="font-bold text-lg">Invoice Uploader AI</span>
          </div>
          <div className="flex items-center space-x-2 relative">
            <LanguageSelector />
            <DarkModeToggle />
            <button
              onClick={() => setAuthOpen(o => !o)}
              className="btn btn-primary bg-white text-indigo-700 hover:bg-gray-100 flex items-center"
            >
              <span className="mr-1">Account</span>
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
            {authOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded shadow-lg z-20"
              >
                <Link
                  to="/invoices"
                  className="block px-4 py-2 text-sm group hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => setAuthOpen(false)}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 transform transition-transform group-hover:translate-x-1" />
                  <span className="border-b-2 border-transparent group-hover:border-indigo-600 transition-all">Sign In</span>
                </Link>
                <Link
                  to="/onboarding"
                  className="block px-4 py-2 text-sm group hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => setAuthOpen(false)}
                >
                  <UserPlusIcon className="w-4 h-4 mr-2 transform transition-transform group-hover:translate-x-1" />
                  <span className="border-b-2 border-transparent group-hover:border-indigo-600 transition-all">Sign Up</span>
                </Link>
              </motion.div>
            )}
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
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <Link to="/invoices" className="btn btn-primary text-lg px-8 py-3">Try Invoice Uploader AI → Get Started</Link>
              <button
                onClick={() => setDemoOpen(true)}
                className="btn btn-secondary text-lg px-8 py-3 flex items-center justify-center"
              >
                Live Demo
              </button>
            </div>
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
        <h2 className="text-3xl font-bold text-center mb-4">Progress Dashboard</h2>
        <div className="container mx-auto px-6">
          <ProgressDashboard />
          <div className="text-center mt-4">
            <DummyDataButton />
          </div>
        </div>
      </section>
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-4">Split-Second AI Search</h2>
        <div className="container mx-auto px-6">
          <AiSearchDemo />
        </div>
      </section>
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Use Case Gallery</h2>
        <div className="container mx-auto grid md:grid-cols-4 gap-8 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center space-y-2">
              <ShoppingCartIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="font-semibold">Procurement</h3>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="text-center space-y-2">
              <UserGroupIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="font-semibold">AP Teams</h3>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="text-center space-y-2">
              <ScaleIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="font-semibold">Legal Compliance</h3>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="text-center space-y-2">
              <BoltIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h3 className="font-semibold">Expense Automation</h3>
            </Card>
          </motion.div>
        </div>
      </section>
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">AI Feature Walkthrough</h2>
        <div className="container mx-auto overflow-x-auto px-6">
          <div className="flex items-center space-x-4 w-max">
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <DocumentArrowUpIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Upload</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <CheckCircleIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Validate</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <TagIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Auto-tag</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <ShieldExclamationIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Fraud Detection</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <LightBulbIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Insights</span>
            </Card>
          </div>
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
        <h2 className="text-3xl font-bold text-center mb-8">Security &amp; Compliance</h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="text-center space-y-2">
            <ShieldCheckIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">SOC2 Compliant</h3>
          </Card>
          <Card className="text-center space-y-2">
            <GlobeAltIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">GDPR Ready</h3>
          </Card>
          <Card className="text-center space-y-2">
            <LockClosedIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">SSL Encryption</h3>
          </Card>
        </div>
        <p className="text-center mt-6 font-semibold text-indigo-600 dark:text-indigo-400">Bank-grade encryption</p>
      </section>
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Developers</h2>
        <p className="text-center mb-4">Explore our API and build custom integrations.</p>
        <div className="text-center">
          <Link to="/api-docs" className="btn btn-primary text-lg px-8 py-3">View API Docs</Link>
        </div>
      </section>
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Case Studies</h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="space-y-2">
            <h3 className="font-semibold">Acme Corp</h3>
            <p className="text-sm">Reduced processing costs by 40%.</p>
          </Card>
          <Card className="space-y-2">
            <h3 className="font-semibold">Globex</h3>
            <p className="text-sm">Accelerated approvals to same day.</p>
          </Card>
          <Card className="space-y-2">
            <h3 className="font-semibold">Initech</h3>
            <p className="text-sm">Gained real-time vendor insights.</p>
          </Card>
        </div>
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
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Blog</h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="space-y-1">
            <h3 className="font-semibold">AI in Finance</h3>
            <p className="text-xs text-gray-500">Jan 5, 2024</p>
          </Card>
          <Card className="space-y-1">
            <h3 className="font-semibold">Automating AP Workflows</h3>
            <p className="text-xs text-gray-500">Feb 12, 2024</p>
          </Card>
          <Card className="space-y-1">
            <h3 className="font-semibold">Security Best Practices</h3>
            <p className="text-xs text-gray-500">Mar 22, 2024</p>
          </Card>
        </div>
      </section>
      <footer className="bg-gray-100 dark:bg-gray-900 p-8 text-gray-600 dark:text-gray-400">
        <div className="container mx-auto grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-semibold mb-2">About Us</h3>
            <p className="text-xs">
              Invoice Uploader AI simplifies accounts payable with automation and
              AI-driven insights.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/invoices" className="hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:underline">
                  Reports
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:underline">
                  Sign Up
                </Link>
              </li>
              <li>
                <a href="/api-docs" className="hover:underline">
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Follow</h3>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:text-indigo-600 transition-colors"
              >
                <AtSymbolIcon className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-indigo-600 transition-colors"
              >
                <BriefcaseIcon className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-indigo-600 transition-colors"
              >
                <CodeBracketSquareIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Newsletter</h3>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="input flex-1 text-xs"
              />
              <button className="btn btn-primary px-3 flex items-center" type="submit">
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                Sign Up
              </button>
            </form>
          </div>
        </div>
        <p className="text-center mt-8 text-xs">
          © {new Date().getFullYear()} Invoice Uploader AI
        </p>
      </footer>
      <DemoUploadModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
