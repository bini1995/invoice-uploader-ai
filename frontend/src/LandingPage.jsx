import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ChartBarIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  TagIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  ArrowLongRightIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import ProgressDashboard from './components/ProgressDashboard';
import AiSearchDemo from './components/AiSearchDemo';
import DummyDataButton from './components/DummyDataButton';
import SplitScreenStory from './components/SplitScreenStory';
import ScrollingUseCases from './components/ScrollingUseCases';
import HowItWorks from './components/HowItWorks';
import HeroSection from './components/HeroSection';
import FeatureCard from './components/FeatureCard';
import ProblemSolutionSection from './components/ProblemSolutionSection';
import ScheduleDemoModal from './components/ScheduleDemoModal';
import SocialProofSection from './components/SocialProofSection';
import CsvUploadFlowDemo from './components/CsvUploadFlowDemo';
import BlogSection from './components/BlogSection';
import ChatWidget from './components/ChatWidget';
import PricingSection from './components/PricingSection';
import FeatureComparisonTable from './components/FeatureComparisonTable';
import AddOnsTable from './components/AddOnsTable';
import FaqAccordion from './components/FaqAccordion';
import TestimonialSlider from './components/TestimonialSlider';
import PriceCalculator from './components/PriceCalculator';
import TrustSection from './components/TrustSection';

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="sticky top-0 bg-white/80 backdrop-blur dark:bg-gray-900/80 shadow z-30">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <DocumentArrowUpIcon className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-lg">ClarifyOps</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <a href="#product" className="hover:text-indigo-600">Product</a>
            <a href="#how-it-works" className="hover:text-indigo-600">How It Works</a>
            <a href="#customers" className="hover:text-indigo-600">Customers</a>
            <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
            <a href="#resources" className="hover:text-indigo-600">Resources</a>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Button onClick={() => setDemoOpen(true)}>Request Demo</Button>
            <a
              href="#pricing"
              className="underline text-sm hover:text-indigo-600"
            >
              See all plans
            </a>
            <Button asChild variant="secondary">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
          <div className="sm:hidden flex items-center space-x-2">
            <Button size="sm" asChild variant="secondary">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <HeroSection onRequestDemo={() => setDemoOpen(true)} />
      <ProblemSolutionSection />
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-6">Interactive Demo</h2>
        <CsvUploadFlowDemo />
      </section>
      <section id="features" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-6">
          <FeatureCard
            icon={DocumentArrowUpIcon}
            title="Invoice Upload"
            description="Import CSVs or PDFs in seconds."
          />
          <FeatureCard
            icon={CheckCircleIcon}
            title="AI Validation"
            description="Catch errors before they hit your books."
          />
          <FeatureCard
            icon={ExclamationCircleIcon}
            title="Error Insights"
            description="Understand issues with smart summaries."
          />
          <FeatureCard
            icon={ChartBarIcon}
            title="Analytics"
            description="See trends and anomalies instantly."
          />
          <FeatureCard
            icon={ArrowDownTrayIcon}
            title="Export to Finance"
            description="Send clean data to your ERP."
          />
        </div>
      </section>
      <SocialProofSection />
      <PricingSection />
      <section id="customers" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Why Teams Choose Us Over Other Tools</h2>
        <div className="container mx-auto overflow-x-auto px-6">
          <div className="flex space-x-4 w-max">
            {[
              {
                label: 'AI Email Drafting',
                ours: true,
                a: false,
                b: true,
              },
              {
                label: 'Real-Time Anomaly Detection',
                ours: true,
                a: false,
                b: false,
              },
              {
                label: 'White-label + Multitenancy',
                ours: true,
                a: false,
                b: false,
              },
              {
                label: 'Upload CSV/PDF/Image',
                ours: true,
                a: true,
                b: true,
              },
            ].map((f) => (
              <Card key={f.label} className="min-w-[220px] p-4 space-y-3 text-center">
                <h4 className="font-semibold mb-2">{f.label}</h4>
                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                  <span className="font-medium text-left">ClarifyOps</span>
                  <span className="font-medium">A</span>
                  <span className="font-medium">B</span>
                  {f.ours ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500" />
                  )}
                  {f.a ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500" />
                  )}
                  {f.b ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section id="resources" className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Deep-Dive on Your Differentiators</h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="text-center space-y-4 p-6">
            <LightBulbIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">Understand Invoices at a Glance</h3>
            <p className="text-sm">Smart categorization and clear AI summaries make every invoice obvious.</p>
            <div className="flex justify-center space-x-2">
              <Button asChild className="text-sm px-4 py-2">
                <Link to="/onboarding">Start Now</Link>
              </Button>
              <Button asChild variant="secondary" className="text-sm px-4 py-2">
                <Link to="/sandbox">Learn more</Link>
              </Button>
            </div>
          </Card>
          <Card className="text-center space-y-4 p-6">
            <BriefcaseIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">Automate Your Finance Stack</h3>
            <p className="text-sm">Fraud signals, reminders and recurring invoices handled automatically.</p>
            <div className="flex justify-center space-x-2">
              <Button asChild className="text-sm px-4 py-2">
                <Link to="/onboarding">Start Now</Link>
              </Button>
              <Button asChild variant="secondary" className="text-sm px-4 py-2">
                <Link to="/sandbox">Learn more</Link>
              </Button>
            </div>
          </Card>
          <Card className="text-center space-y-4 p-6">
            <GlobeAltIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">Flexible, Enterprise-Ready Features</h3>
            <p className="text-sm">Workflow builder, audit trail and multi-tenant support out of the box.</p>
            <div className="flex justify-center space-x-2">
              <Button asChild className="text-sm px-4 py-2">
                <Link to="/onboarding">Start Now</Link>
              </Button>
              <Button asChild variant="secondary" className="text-sm px-4 py-2">
                <Link to="/sandbox">Learn more</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Try the Dashboard →</h2>
        <p className="text-center mb-4 text-gray-600 dark:text-gray-300">No signup needed. Test it instantly.</p>
        <div className="container mx-auto px-6">
          <ProgressDashboard />
          <div className="text-center mt-4">
            <DummyDataButton className="btn btn-primary text-lg" />
          </div>
        </div>
      </section>
      <SplitScreenStory />
      <HowItWorks />
      <section id="search-demo" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-4">Split-Second AI Search</h2>
        <div className="container mx-auto px-6">
          <AiSearchDemo />
        </div>
      </section>
      <ScrollingUseCases />
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
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
      <section className="py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-8"
        >
          What People Are Saying
        </motion.h2>
        <TestimonialSlider
          testimonials={[
            {
              quote: 'This app cut our invoice processing time in half.',
              author: 'Sarah',
              company: 'Acme Corp',
              image: 'https://i.pravatar.cc/100?img=12',
              highlight: true,
            },
            {
              quote: 'Saved our team 40+ hours weekly.',
              author: 'Alex',
              company: 'Globex',
              image: 'https://i.pravatar.cc/100?img=5',
            },
            {
              quote: 'A must-have for finance automation.',
              author: 'Jamie',
              company: 'Initech',
              image: 'https://i.pravatar.cc/100?img=6',
            },
          ]}
        />
      </section>
      <BlogSection />
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-2">Security &amp; Compliance</h2>
        <p className="text-center mb-8 text-indigo-600 dark:text-indigo-400 font-medium">
          Security-first infrastructure for sensitive financial data
        </p>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="text-center space-y-2">
            <GlobeAltIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">GDPR Ready</h3>
          </Card>
          <Card className="text-center space-y-2">
            <ShieldCheckIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">SOC 2 Compliant</h3>
          </Card>
          <Card className="text-center space-y-2">
            <LockClosedIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">End-to-End Encryption</h3>
          </Card>
        </div>
        <p className="text-center mt-6 font-semibold text-indigo-600 dark:text-indigo-400">Bank-grade encryption</p>
      </section>
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Developers</h2>
        <p className="text-center mb-4">Explore our API and build custom integrations.</p>
        <div className="text-center">
          <Button asChild className="text-lg px-8 py-3">
            <Link to="/api-docs">View API Docs</Link>
          </Button>
        </div>
      </section>
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
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
      <FeatureComparisonTable />
      <PriceCalculator />
      <AddOnsTable />
      <TrustSection />
      <FaqAccordion />
      <footer className="bg-gray-100 dark:bg-gray-900 p-8 text-gray-600 dark:text-gray-400">
        <div className="container mx-auto grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Product</h3>
            <ul className="space-y-1">
              <li>
                <a href="#features" className="hover:underline">Features</a>
              </li>
              <li>
                <a href="#pricing" className="hover:underline">Pricing</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:underline">How It Works</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Company</h3>
            <ul className="space-y-1">
              <li>
                <a href="#about" className="hover:underline">About</a>
              </li>
              <li>
                <Link to="/careers" className="hover:underline">Careers</Link>
              </li>
              <li>
                <a href="mailto:contact@clarifyops.com" className="hover:underline">Contact</a>
              </li>
              <li>
                <Link to="/blog" className="hover:underline">Blog</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/terms" className="hover:underline">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Resources</h3>
            <form className="flex space-x-2 mb-2" aria-label="Subscribe to updates">
              <input
                type="email"
                placeholder="you@example.com"
                className="input flex-1 text-xs"
              />
              <Button type="submit" className="px-3 flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-1" />
                Subscribe
              </Button>
            </form>
            <ul className="space-y-1">
              <li>
                <a href="/api-docs" className="hover:underline">API Docs</a>
              </li>
              <li>
                <a href="#resources" className="hover:underline">Help Center</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-center mt-8 text-xs">
          © {new Date().getFullYear()} ClarifyOps
        </p>
      </footer>
      </div>
      <ChatWidget />
      <ScheduleDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
