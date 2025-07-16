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
} from '@heroicons/react/24/outline';
import Carousel from './components/Carousel';
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
            <Button asChild variant="secondary">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </nav>
      <HeroSection onRequestDemo={() => setDemoOpen(true)} />
      <ProblemSolutionSection />
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-6">Interactive Demo</h2>
        <CsvUploadFlowDemo />
      </section>
      <section id="features" className="py-12 bg-gray-50 dark:bg-gray-800">
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
      <section id="customers" className="py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Why Teams Choose Us Over Other Tools</h2>
        <div className="container mx-auto overflow-x-auto px-6">
          <table className="min-w-full text-sm text-center">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 text-left">Feature</th>
                <th className="border-b px-4 py-2">ClarifyOps</th>
                <th className="border-b px-4 py-2">Competitor A</th>
                <th className="border-b px-4 py-2">Competitor B</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 text-left">Upload CSV/PDF/Image</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">✅</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">Natural Language Insights</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
                <td className="px-4 py-2">❌</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">AI-generated Emails</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
                <td className="px-4 py-2">✅</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">Fraud Detection</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
                <td className="px-4 py-2">❌</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">Recurring Billing Automation</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
                <td className="px-4 py-2">❌</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">Audit Logs &amp; Scoring</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">Workflow Builder</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
                <td className="px-4 py-2">❌</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">Slack/Teams Integration</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
                <td className="px-4 py-2">✅</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-left">Whitelabel &amp; Multitenancy</td>
                <td className="px-4 py-2">✅</td>
                <td className="px-4 py-2">❌</td>
                <td className="px-4 py-2">❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="resources" className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Deep-Dive on Your Differentiators
        </h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="text-center space-y-4 p-6">
            <LightBulbIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">AI That Understands and Acts</h3>
            <p className="text-sm">
              Smart categorization, natural language invoice summaries and scoring with clear explanations.
            </p>
            <div className="flex justify-center space-x-2">
              <Button asChild className="text-sm px-4 py-2">
                <Link to="/onboarding">Try it</Link>
              </Button>
              <Button asChild variant="secondary" className="text-sm px-4 py-2">
                <Link to="/sandbox">Learn more</Link>
              </Button>
            </div>
          </Card>
          <Card className="text-center space-y-4 p-6">
            <BriefcaseIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">Built-In Finance Ops</h3>
            <p className="text-sm">
              Auto-send reminders, detect fraud signals and automate recurring invoices out of the box.
            </p>
            <div className="flex justify-center space-x-2">
              <Button asChild className="text-sm px-4 py-2">
                <Link to="/onboarding">Try it</Link>
              </Button>
              <Button asChild variant="secondary" className="text-sm px-4 py-2">
                <Link to="/sandbox">Learn more</Link>
              </Button>
            </div>
          </Card>
          <Card className="text-center space-y-4 p-6">
            <GlobeAltIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">Customizable &amp; Enterprise Ready</h3>
            <p className="text-sm">
              Build workflows, support multiple tenants and integrate with Slack or Teams complete with an audit trail.
            </p>
            <div className="flex justify-center space-x-2">
              <Button asChild className="text-sm px-4 py-2">
                <Link to="/onboarding">Try it</Link>
              </Button>
              <Button asChild variant="secondary" className="text-sm px-4 py-2">
                <Link to="/sandbox">Learn more</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
      <section className="py-12">
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
      <section id="pricing" className="py-12 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-4">Split-Second AI Search</h2>
        <div className="container mx-auto px-6">
          <AiSearchDemo />
        </div>
      </section>
      <ScrollingUseCases />
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
      <BlogSection />
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
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
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Developers</h2>
        <p className="text-center mb-4">Explore our API and build custom integrations.</p>
        <div className="text-center">
          <Button asChild className="text-lg px-8 py-3">
            <Link to="/api-docs">View API Docs</Link>
          </Button>
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
      <PricingSection />
      <FeatureComparisonTable />
      <AddOnsTable />
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
      <ChatWidget />
      <ScheduleDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
