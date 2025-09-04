import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Bars3Icon, 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  CogIcon,
  SparklesIcon,
  BoltIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  PlayIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Button } from './components/ui/Button';
import LoginLink from './components/LoginLink';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import { logEvent, getRequestId } from './lib/analytics';

const DEMO_URL = 'https://calendly.com/taddessebi95/clarifyops-demo';
const HEADER_HEIGHT = 72;

export default function LandingPage() {
  const sentDepth = useRef({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scheduleDemo = source => {
    logEvent('demo_click', { source, request_id: getRequestId() });
    window.open(DEMO_URL, '_blank', 'noopener');
  };

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const supportHref = (() => {
    const reqId = getRequestId();
    const body = encodeURIComponent(`Request ID: ${reqId}\nUser-Agent: ${navigator.userAgent}`);
    return `mailto:support@clarifyops.com?subject=${encodeURIComponent('Login/Access')}&body=${body}`;
  })();

  const features = [
    {
      icon: CpuChipIcon,
      title: "AI-Powered Fraud Detection",
      description: "Advanced machine learning algorithms detect suspicious patterns with 99.7% accuracy",
      color: "blue",
      highlight: "99.7% Accuracy"
    },
    {
      icon: BoltIcon,
      title: "Real-Time Processing",
      description: "Process claims in under 30 minutes with our lightning-fast AI engine",
      color: "green",
      highlight: "<30 min"
    },
    {
      icon: LockClosedIcon,
      title: "Bank-Grade Security",
      description: "SOC 2 Type II, HIPAA, and GDPR compliant with end-to-end encryption",
      color: "purple",
      highlight: "SOC 2 Type II"
    },
    {
      icon: ChartBarIcon,
      title: "Predictive Analytics",
      description: "AI-driven insights reduce claim costs by up to 40% through predictive modeling",
      color: "orange",
      highlight: "40% Cost Reduction"
    },
    {
      icon: GlobeAltIcon,
      title: "Multi-Tenant Architecture",
      description: "Enterprise-grade scalability supporting 10,000+ concurrent users",
      color: "indigo",
      highlight: "10K+ Users"
    },
    {
      icon: CloudArrowUpIcon,
      title: "Blockchain Integration",
      description: "Immutable audit trails and smart contracts for complete transparency",
      color: "emerald",
      highlight: "100% Transparent"
    }
  ];

  const metrics = [
    { value: "<1", unit: "day", label: "Average Processing Time", description: "vs 2+ days industry standard" },
    { value: "99.9", unit: "%", label: "Uptime SLA", description: "Enterprise-grade reliability" },
    { value: "95", unit: "+", label: "NPS Score", description: "vs 90 industry average" },
    { value: "<0.5", unit: "%", label: "Error Rate", description: "vs 2% industry standard" }
  ];

  const processSteps = [
    {
      number: "01",
      title: "Intelligent Document Upload",
      description: "AI instantly extracts and validates all claim data with 99.7% accuracy",
      icon: CloudArrowUpIcon,
      color: "blue"
    },
    {
      number: "02", 
      title: "AI-Powered Analysis",
      description: "Advanced algorithms detect fraud, validate coverage, and calculate settlements",
      icon: CpuChipIcon,
      color: "green"
    },
    {
      number: "03",
      title: "Automated Workflows",
      description: "Smart routing and approval processes reduce manual intervention by 80%",
      icon: CogIcon,
      color: "purple"
    },
    {
      number: "04",
      title: "Real-Time Reporting",
      description: "Live dashboards and analytics provide instant insights and transparency",
      icon: ChartBarIcon,
      color: "orange"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900" ref={containerRef}>
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-gray-200">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="ClarifyOps" 
              className="h-8 w-auto"
            />
          </a>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#metrics" className="hover:text-blue-600 transition-colors">Performance</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            {token ? (
              <a
                href="/app"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SparklesIcon className="h-4 w-4" />
                Go to Dashboard
              </a>
            ) : (
              <LoginLink source="header" className="block px-4 py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
                Log in
              </LoginLink>
            )}
            <Button onClick={() => scheduleDemo('nav')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="block hover:text-blue-600 transition-colors">How it Works</a>
              <a href="#metrics" className="block hover:text-blue-600 transition-colors">Performance</a>
              <a href="#pricing" className="block hover:text-blue-600 transition-colors">Pricing</a>
              {token ? (
                <a
                  href="/app"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Go to Dashboard
                </a>
              ) : (
                <LoginLink source="header" className="block px-4 py-2 border border-gray-300 rounded-lg text-center hover:bg-gray-50">
                  Log in
                </LoginLink>
              )}
              <Button onClick={() => scheduleDemo('nav')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 px-6 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.span 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 mb-6 border border-blue-200"
                whileHover={{ scale: 1.05 }}
              >
                <StarIcon className="h-4 w-4 mr-2 text-yellow-500" />
                🚀 Y Combinator Alumni • Backed by Microsoft & AWS
              </motion.span>
              
              <motion.h1 
                className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                The Future of
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block">
                  Claims Management
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <strong>ClarifyOps is an InsurTech shaping the future of claims.</strong> We combine advanced AI with a best-in-class team to manage the entire claims process for insurance companies—from receiving a claim to making coverage decisions and issuing payments.
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                onClick={() => scheduleDemo('hero')} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Schedule a Demo
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg hover:border-blue-300 transition-all duration-300"
                onClick={() => setIsVideoPlaying(true)}
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex flex-wrap justify-center gap-8 text-sm text-gray-600"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>GDPR Ready</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust Logos Section */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p 
              className="text-center text-gray-500 text-sm mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Trusted by leading companies worldwide
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center items-center gap-8 opacity-60"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.6, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Add actual company logos here */}
              <div className="text-2xl font-bold text-gray-400">Y Combinator</div>
              <div className="text-2xl font-bold text-gray-400">Microsoft</div>
              <div className="text-2xl font-bold text-gray-400">AWS</div>
              <div className="text-2xl font-bold text-gray-400">OpenAI</div>
              <div className="text-2xl font-bold text-gray-400">Anthropic</div>
            </motion.div>
          </div>
        </section>

        {/* Performance Metrics Section */}
        <section id="metrics" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Performance that speaks for itself
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our AI-powered platform delivers results that far exceed industry standards
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="text-center p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {metric.value}<span className="text-2xl">{metric.unit}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{metric.label}</h3>
                  <p className="text-gray-600 text-sm">{metric.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything you need to process claims faster
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From intelligent document processing to automated fraud detection, we've built the complete claims management platform.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="text-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-blue-200 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${feature.color}-100 text-${feature.color}-800`}>
                    {feature.highlight}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How ClarifyOps Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform streamlines the entire claims lifecycle with intelligent automation and AI-powered insights.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r from-${step.color}-600 to-${step.color}-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to transform your claims process?
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100 mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join leading insurance companies who trust ClarifyOps to process claims faster, reduce costs, and improve customer satisfaction.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                onClick={() => scheduleDemo('cta')} 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
              >
                Schedule a Demo
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg"
              >
                View Pricing
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/logo.svg" alt="ClarifyOps" className="h-8 w-auto mb-4" />
              <p className="text-gray-400">
                The future of claims management powered by AI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href={supportHref} className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClarifyOps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

