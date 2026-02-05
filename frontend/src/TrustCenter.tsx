import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ServerStackIcon,
  EyeSlashIcon,
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  KeyIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import LoginLink from './components/LoginLink';

const certifications = [
  {
    icon: ShieldCheckIcon,
    title: 'HIPAA Compliance',
    status: 'Committed',
    iconColorClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    description: 'We build ClarifyOps with HIPAA requirements in mind. Administrative, physical, and technical safeguards are implemented to protect Protected Health Information (PHI) processed through our platform.',
    details: [
      'Business Associate Agreements available for customers',
      'PHI detection and redaction capabilities',
      'Activity logging for data access and modifications',
      'Breach notification procedures documented',
      'Ongoing risk assessments and security improvements'
    ]
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'SOC 2 Type II',
    status: 'In Progress',
    iconColorClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-700',
    description: 'Pursuing SOC 2 Type II certification across all five Trust Service Categories: Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
    details: [
      'Security controls aligned to AICPA standards',
      'Monitoring and logging infrastructure in place',
      'Third-party penetration testing planned',
      'Information security policies being formalized',
      'Vendor risk management program in development'
    ]
  },
  {
    icon: DocumentCheckIcon,
    title: 'GDPR Awareness',
    status: 'In Progress',
    iconColorClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-700',
    description: 'We are building our platform with GDPR principles in mind to support processing personal data of EU residents and protect data subject rights.',
    details: [
      'Data Processing Agreements available upon request',
      'Right to erasure and data portability supported',
      'Privacy by design principles applied',
      'Data protection impact assessments planned',
      'Data protection contacts designated'
    ]
  }
];

const securityPractices = [
  {
    icon: LockClosedIcon,
    title: 'Encryption',
    description: 'AES-256 encryption for sensitive data fields. TLS 1.2+ encryption in transit for all communications. Bcrypt password hashing with configurable work factors.'
  },
  {
    icon: KeyIcon,
    title: 'Authentication & Access Control',
    description: 'JWT-based authentication with refresh tokens, role-based access control (RBAC) with 6 distinct roles, Google SSO integration, and automatic session expiration.'
  },
  {
    icon: ServerStackIcon,
    title: 'Infrastructure Security',
    description: 'Hosted on DigitalOcean infrastructure. PostgreSQL database managed by Neon with automated backups. SSL certificates via Let\'s Encrypt with auto-renewal.'
  },
  {
    icon: EyeSlashIcon,
    title: 'PHI Protection',
    description: 'Detection and redaction of common PHI identifiers including SSNs, dates of birth, phone numbers, and member IDs to reduce exposure when processing documents.'
  },
  {
    icon: UserGroupIcon,
    title: 'Multi-Tenant Isolation',
    description: 'Complete data isolation between organizations using tenant-scoped queries. Every database operation is filtered by tenant ID to prevent cross-tenant data exposure.'
  },
  {
    icon: DocumentCheckIcon,
    title: 'Audit Logging',
    description: 'Activity logging for data operations including document uploads, views, edits, exports, and deletions. Audit trail supports compliance reporting requirements.'
  },
  {
    icon: CloudArrowUpIcon,
    title: 'Secure File Processing',
    description: 'File upload validation with type checking and size limits. Input sanitization to prevent malicious content. Supported formats include PDF, Word, images, and spreadsheets.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Network Security',
    description: 'Nginx reverse proxy with rate limiting, security headers via Helmet.js, input sanitization, and protection against common web vulnerabilities (XSS, CSRF, SQL injection).'
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function TrustCenter() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-white/40 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/">
            <img src="/logo.png" alt="ClarifyOps" className="h-7" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/security" className="hover:text-blue-600 transition-colors">Security</Link>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <LoginLink source="trust-center" className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50">
              Log in
            </LoginLink>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-24 px-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
          <motion.div
            className="max-w-4xl mx-auto text-center relative z-10"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
              <span>Enterprise-Grade Security</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trust Center
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transparency is at the core of everything we do. Learn about how ClarifyOps protects your data, 
              maintains compliance, and earns your trust every day.
            </p>
          </motion.div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Compliance & Certifications</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We pursue and maintain industry-leading compliance certifications to ensure your data 
                is handled with the highest standards of care.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {certifications.map((cert, i) => (
                <motion.div
                  key={cert.title}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <cert.icon className={`h-10 w-10 ${cert.iconColorClass}`} />
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${cert.badgeClass}`}>
                      {cert.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{cert.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{cert.description}</p>
                  <ul className="space-y-2">
                    {cert.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Security Practices</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Security isn't just a feature — it's built into every layer of ClarifyOps. Here's how we protect your data.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityPractices.map((practice, i) => (
                <motion.div
                  key={practice.title}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <practice.icon className="h-8 w-8 text-indigo-600 mb-4" />
                  <h3 className="font-semibold mb-2">{practice.title}</h3>
                  <p className="text-sm text-gray-600">{practice.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Data Handling Principles</h2>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  title: 'Data Minimization',
                  description: 'We collect and retain only the data necessary to provide our services. PHI is processed in-memory where possible and redacted before being sent to third-party AI services.'
                },
                {
                  title: 'Purpose Limitation',
                  description: 'Your data is used exclusively for the claims processing services you\'ve authorized. We never sell data, use it for advertising, or share it beyond what\'s needed for service delivery.'
                },
                {
                  title: 'Data Retention',
                  description: 'We maintain configurable retention policies. Data can be deleted upon request in accordance with HIPAA and GDPR requirements. Audit logs are retained per regulatory minimums.'
                },
                {
                  title: 'Subprocessor Transparency',
                  description: 'We maintain a clear list of subprocessors who may handle your data: Neon (database hosting), DigitalOcean (infrastructure), OpenRouter (AI processing with PHI redaction), and Let\'s Encrypt (SSL).'
                },
                {
                  title: 'Incident Response',
                  description: 'We maintain a documented incident response plan with defined severity levels. Any breach involving PHI is reported within the HIPAA-required timeframes, and affected parties are notified promptly.'
                }
              ].map((principle, i) => (
                <motion.div
                  key={principle.title}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <h3 className="font-semibold text-lg mb-2">{principle.title}</h3>
                  <p className="text-gray-600">{principle.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Have Security Questions?</h2>
              <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                Our team is ready to discuss our security practices, provide compliance documentation, 
                or address any concerns about data protection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:security@clarifyops.com"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-indigo-700 font-semibold rounded-full hover:bg-indigo-50 transition-colors"
                >
                  Contact Security Team
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
                <Link
                  to="/privacy"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="ClarifyOps" className="h-6 brightness-0 invert" />
            <span className="text-gray-400 text-sm">&copy; 2026 ClarifyOps. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
