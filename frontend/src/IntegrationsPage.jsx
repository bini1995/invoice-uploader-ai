import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  CogIcon,
  ServerStackIcon,
  DocumentTextIcon,
  BoltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const coreIntegrations = [
  {
    name: 'Guidewire ClaimCenter',
    logo: '🏢',
    category: 'Claims Management',
    description: 'Bidirectional sync with Guidewire ClaimCenter for seamless claims handoff and status updates.',
    features: ['Auto-create claims', 'Sync extracted data', 'Status webhooks', 'Document attachment'],
    status: 'Available'
  },
  {
    name: 'Duck Creek Claims',
    logo: '🦆',
    category: 'Claims Management',
    description: 'Native integration with Duck Creek for policy validation and claims submission.',
    features: ['Policy lookup', 'Claims submission', 'Coverage validation', 'Real-time sync'],
    status: 'Available'
  },
  {
    name: 'Salesforce',
    logo: '☁️',
    category: 'CRM',
    description: 'Connect claims data with your Salesforce instance for complete customer visibility.',
    features: ['Contact matching', 'Case creation', 'Custom objects', 'Activity logging'],
    status: 'Available'
  },
  {
    name: 'ServiceNow',
    logo: '⚙️',
    category: 'ITSM',
    description: 'Create and manage incidents and requests from claims processing workflows.',
    features: ['Incident creation', 'Workflow triggers', 'SLA tracking', 'Escalation rules'],
    status: 'Available'
  }
];

const automationIntegrations = [
  {
    name: 'Zapier',
    logo: '⚡',
    description: 'Connect to 5,000+ apps with no-code automation',
    triggers: ['New claim uploaded', 'Claim status changed', 'High-risk flag', 'Extraction complete'],
    actions: ['Create record', 'Send notification', 'Update CRM', 'Generate report']
  },
  {
    name: 'Microsoft Power Automate',
    logo: '🔄',
    description: 'Enterprise automation with Microsoft ecosystem',
    triggers: ['Claim events', 'Scheduled exports', 'Threshold alerts'],
    actions: ['Teams notification', 'SharePoint upload', 'Excel update', 'Outlook email']
  },
  {
    name: 'Webhooks',
    logo: '🔗',
    description: 'Real-time event notifications to any endpoint',
    triggers: ['All claim events', 'Custom filters', 'Batch updates'],
    actions: ['POST to any URL', 'Custom headers', 'Retry logic', 'Event logging']
  }
];

const apiFeatures = [
  { icon: BoltIcon, title: 'RESTful API', description: 'Clean, well-documented REST endpoints for all operations' },
  { icon: ShieldCheckIcon, title: 'OAuth 2.0', description: 'Secure authentication with token refresh and scopes' },
  { icon: DocumentTextIcon, title: 'OpenAPI Spec', description: 'Full OpenAPI 3.0 specification for easy integration' },
  { icon: ServerStackIcon, title: 'Webhooks', description: 'Real-time event notifications for claim lifecycle' },
  { icon: CodeBracketIcon, title: 'SDKs', description: 'Official SDKs for Python, Node.js, and Java' },
  { icon: CogIcon, title: 'Sandbox', description: 'Full sandbox environment for testing integrations' }
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <a href="/">
            <img src="/logo.png" alt="ClarifyOps" className="h-10 w-auto" />
          </a>
          <a
            href="https://calendly.com/clarifyops-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
        </nav>
      </header>

      <main>
        <section className="py-20 px-6 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
          <div className="max-w-5xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-6"
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Enterprise Integrations
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Connect ClarifyOps to Your
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Existing Stack</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/70 max-w-3xl mx-auto"
            >
              Pre-built connectors for insurance platforms, automation tools, and enterprise systems. 
              Go live in days, not months.
            </motion.p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Core Platform Integrations</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Connect directly with leading insurance and enterprise platforms
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {coreIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{integration.logo}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{integration.name}</h3>
                        <span className="text-sm text-gray-500">{integration.category}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{integration.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Automation & Workflows</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Connect ClarifyOps to thousands of apps with no-code automation
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {automationIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{integration.logo}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{integration.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{integration.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Triggers</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.triggers.map((trigger) => (
                        <span key={trigger} className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.actions.map((action) => (
                        <span key={action} className="px-2 py-1 rounded text-xs bg-emerald-50 text-emerald-700">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Developer API</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Full-featured API for custom integrations and advanced use cases
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {apiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <CodeBracketIcon className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-mono">Example API Call</span>
              </div>
              <pre className="bg-slate-800 rounded-xl p-6 overflow-x-auto text-sm">
                <code className="text-gray-300">
{`curl -X POST https://api.clarifyops.com/v1/claims/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "document=@claim.pdf" \\
  -F "options={\"extractCodes\":true,\"detectFraud\":true}"`}
                </code>
              </pre>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need a Custom Integration?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Our team can help build custom connectors for your specific tech stack
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendly.com/clarifyops-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                Talk to Integration Team
                <ArrowRightIcon className="h-5 w-5" />
              </a>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            2024 ClarifyOps. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
