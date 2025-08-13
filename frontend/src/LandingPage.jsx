import React, { useState, useEffect } from 'react';
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
import { logEvent } from './lib/analytics';

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [sent50, setSent50] = useState(false);
  const [sent90, setSent90] = useState(false);
  const timeRange = JSON.parse(localStorage.getItem('timeRange') || '{}');

  useEffect(() => {
    const onScroll = () => {
      const depth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (!sent50 && depth >= 0.5) {
        logEvent('scroll_depth', { depth: 50 });
        setSent50(true);
      }
      if (!sent90 && depth >= 0.9) {
        logEvent('scroll_depth', { depth: 90 });
        setSent90(true);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [sent50, sent90]);

  return (
    <>
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute top-0 left-0 bg-surface text-accent p-2"
      >
        Skip to content
      </a>
      <div className="min-h-screen flex flex-col bg-surface text-ink">
      <nav className="sticky top-0 bg-surface/80 backdrop-blur shadow z-30">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="ClarifyOps logo" className="h-7 w-auto" />
            <span className="font-bold text-lg">ClarifyClaims</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <a href="#product" className="hover:text-accent transition-colors duration-fast">Claims Processing</a>
            <a href="#how-it-works" className="hover:text-accent transition-colors duration-fast">How It Works</a>
            <a href="#customers" className="hover:text-accent transition-colors duration-fast">Insurance Teams</a>
            <a href="#pricing" className="hover:text-accent transition-colors duration-fast">Pricing</a>
            <a href="#resources" className="hover:text-accent transition-colors duration-fast">Resources</a>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Button onClick={() => setDemoOpen(true)}>Request Demo</Button>
            <a
              href="#pricing"
              className="underline text-sm hover:text-accent transition-colors duration-fast"
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
        <div id="hero" tabIndex="-1">
          <HeroSection onRequestDemo={() => setDemoOpen(true)} />
        </div>
      <ProblemSolutionSection />
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-6">Interactive Claims Processing Demo</h2>
        <CsvUploadFlowDemo />
      </section>
      <section id="features" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-6">
          <FeatureCard
            icon={DocumentArrowUpIcon}
            title="Claims Upload"
            description="Upload PDFs, images, or scanned documents instantly."
          />
          <FeatureCard
            icon={CheckCircleIcon}
            title="AI Extraction"
            description="Extract structured data with 95%+ accuracy."
          />
          <FeatureCard
            icon={ExclamationCircleIcon}
            title="Fraud Detection"
            description="AI-powered fraud detection and risk scoring."
          />
          <FeatureCard
            icon={ChartBarIcon}
            title="Analytics"
            description="Claims processing insights and dashboards."
          />
          <FeatureCard
            icon={ArrowDownTrayIcon}
            title="Export & Integrate"
            description="Export to your claims management system."
          />
        </div>
      </section>
      <SocialProofSection />
      <PricingSection />
      <section id="customers" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Why Insurance Teams Choose Us Over Other Tools</h2>
        <div className="container mx-auto overflow-x-auto px-6">
          <div className="flex space-x-4 w-max">
            {[
              {
                label: 'AI Claims Extraction',
                ours: true,
                a: false,
                b: true,
              },
              {
                label: 'Fraud Detection',
                ours: true,
                a: false,
                b: false,
              },
              {
                label: 'Multi-format Support',
                ours: true,
                a: false,
                b: false,
              },
              {
                label: 'Real-time Processing',
                ours: true,
                a: true,
                b: true,
              },
              {
                label: 'API Integration',
                ours: true,
                a: false,
                b: true,
              },
            ].map((f) => (
              <Card key={f.label} className="min-w-[220px] p-4 space-y-3 text-center">
                <h4 className="font-semibold mb-2">{f.label}</h4>
                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                  <span className="font-medium text-left">AI Claims Data Extractor</span>
                  <span className="font-medium">Competitor A</span>
                  <span className="font-medium">Competitor B</span>
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
        <h2 className="text-3xl font-bold text-center mb-8">Key Benefits for Insurance Operations</h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="text-center space-y-4 p-6">
            <LightBulbIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">Reduce Processing Time by 70%</h3>
            <p className="text-sm">AI extracts claims data in seconds instead of hours of manual processing.</p>
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
            <h3 className="font-semibold">Eliminate Manual Errors</h3>
            <p className="text-sm">95%+ accuracy reduces costly mistakes and improves claims processing quality.</p>
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
            <h3 className="font-semibold">Built-in Fraud Detection</h3>
            <p className="text-sm">AI-powered fraud detection identifies suspicious patterns and potential red flags.</p>
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
        <h2 className="text-3xl font-bold text-center mb-2">Try Claims Processing →</h2>
        <p className="text-center mb-4 text-muted">No signup needed. Test claims extraction instantly.</p>
        <div className="container mx-auto px-6">
          <ProgressDashboard from={timeRange.from} to={timeRange.to} />
          <div className="text-center mt-4">
            <DummyDataButton className="btn btn-primary text-lg" />
          </div>
        </div>
      </section>
      <SplitScreenStory />
      <HowItWorks />
      <section id="search-demo" className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-4">AI-Powered Claims Search</h2>
        <div className="container mx-auto px-6">
          <AiSearchDemo />
        </div>
      </section>
      <ScrollingUseCases />
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">AI Claims Processing Workflow</h2>
        <div className="container mx-auto overflow-x-auto px-6">
          <div className="flex items-center space-x-4 w-max">
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <DocumentArrowUpIcon className="w-8 h-8 text-accent" />
              <span className="font-semibold">Upload Claim</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-accent flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <CheckCircleIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">AI Extract</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <TagIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Auto-categorize</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <ShieldExclamationIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Fraud Check</span>
            </Card>
            <ArrowLongRightIcon className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <Card className="min-w-[150px] flex flex-col items-center space-y-2">
              <LightBulbIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold">Export Data</span>
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
          What Insurance Teams Are Saying
        </motion.h2>
        <TestimonialSlider
          testimonials={[
            {
              quote: 'This AI tool cut our claims processing time by 70% and eliminated manual data entry errors.',
              author: 'Sarah Johnson',
              company: 'Claims Manager, State Farm',
              image: 'https://i.pravatar.cc/100?img=12',
              highlight: true,
            },
            {
              quote: 'The fraud detection features have saved us thousands in prevented fraudulent claims.',
              author: 'Michael Chen',
              company: 'Director of Operations, Allstate',
              image: 'https://i.pravatar.cc/100?img=5',
            },
            {
              quote: 'Setup took 5 minutes and we were processing claims immediately. Game changer for our team.',
              author: 'Lisa Rodriguez',
              company: 'Claims Processor, Progressive',
              image: 'https://i.pravatar.cc/100?img=6',
            },
            {
              quote: 'The accuracy is incredible - we trust the AI extraction more than manual processing.',
              author: 'David Thompson',
              company: 'VP Claims, Liberty Mutual',
              image: 'https://i.pravatar.cc/100?img=8',
            },
          ]}
        />
      </section>
      <BlogSection />
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-2">Security &amp; Insurance Compliance</h2>
        <p className="text-center mb-8 text-indigo-600 dark:text-indigo-400 font-medium">
          Enterprise-grade security for sensitive insurance claims data
        </p>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="text-center space-y-2">
            <GlobeAltIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">HIPAA Compliant</h3>
          </Card>
          <Card className="text-center space-y-2">
            <ShieldCheckIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">SOC 2 Type II</h3>
          </Card>
          <Card className="text-center space-y-2">
            <LockClosedIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <h3 className="font-semibold">End-to-End Encryption</h3>
          </Card>
        </div>
        <p className="text-center mt-6 font-semibold text-indigo-600 dark:text-indigo-400">Insurance industry security standards</p>
      </section>
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Integrations &amp; API</h2>
        <p className="text-center mb-4">Connect with your existing claims management systems and build custom workflows.</p>
        <div className="text-center">
          <Button asChild className="text-lg px-8 py-3">
            <Link to="/docs">View API Docs</Link>
          </Button>
        </div>
      </section>
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8">Insurance Company Case Studies</h2>
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
          <Card className="space-y-2">
            <h3 className="font-semibold">State Farm</h3>
            <p className="text-sm">Reduced claims processing time by 70% and eliminated manual data entry errors.</p>
          </Card>
          <Card className="space-y-2">
            <h3 className="font-semibold">Allstate</h3>
            <p className="text-sm">Saved $50K monthly in fraud detection and improved processing accuracy to 98%.</p>
          </Card>
          <Card className="space-y-2">
            <h3 className="font-semibold">Progressive</h3>
            <p className="text-sm">Processed 10,000+ claims daily with AI automation and real-time fraud alerts.</p>
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
                <a href="#features" className="hover:underline">Claims Processing</a>
              </li>
              <li>
                <a href="#pricing" className="hover:underline">Pricing</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:underline">How It Works</a>
              </li>
              <li>
                <a href="#customers" className="hover:underline">Case Studies</a>
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
              <li>
                <Link to="/compliance" className="hover:underline">Compliance</Link>
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
                <a href="/docs" className="hover:underline">API Docs</a>
              </li>
              <li>
                <a href="#resources" className="hover:underline">Help Center</a>
              </li>
              <li>
                <a href="/integration" className="hover:underline">Integrations</a>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-center mt-8 text-xs">
          © {new Date().getFullYear()} AI Claims Data Extractor - Insurance Claims Processing Automation
        </p>
      </footer>
    </div>
    <ChatWidget />
    <ScheduleDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
  </>
  );
}
