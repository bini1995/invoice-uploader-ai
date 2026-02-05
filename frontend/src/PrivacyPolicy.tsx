import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import LoginLink from './components/LoginLink';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-white/40 shadow-sm">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/">
            <img src="/logo.png" alt="ClarifyOps" className="h-7" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/trust" className="hover:text-blue-600 transition-colors">Trust Center</Link>
            <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <LoginLink source="privacy-policy" className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50">
              Log in
            </LoginLink>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
              <span>Your Privacy Matters</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-300">Last updated: February 5, 2026</p>
          </motion.div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg prose-gray">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-10 not-prose">
                <p className="text-indigo-800 font-medium">
                  ClarifyOps ("we," "our," or "us") is committed to protecting the privacy of our users and the sensitive 
                  health information processed through our platform. This Privacy Policy describes how we collect, use, disclose, 
                  and safeguard information, including Protected Health Information (PHI) as defined under HIPAA.
                </p>
              </div>

              <h2 className="text-2xl font-bold mt-10 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Account Information</h3>
              <p className="text-gray-700 mb-4">
                When you create an account, we collect your name, email address, and password (hashed using bcrypt). 
                If you sign in via Google SSO, we receive your Google profile name and email address.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Claims and Document Data</h3>
              <p className="text-gray-700 mb-4">
                When you upload claims documents, we process the content to extract relevant fields such as patient names, 
                dates of service, CPT/ICD codes, provider information, and financial data. This data may constitute 
                Protected Health Information (PHI) under HIPAA.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Usage Data</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect information about how you interact with our platform, including pages visited, 
                features used, timestamps, browser type, and IP address. This data is used for analytics and service improvement.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">1.4 Technical Data</h3>
              <p className="text-gray-700 mb-4">
                We collect error reports and performance metrics through Sentry for monitoring service health and 
                debugging issues. We configure error reporting to minimize sensitive data exposure.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide and maintain our claims processing services</li>
                <li>Extract, validate, and classify claims data using AI-powered analysis</li>
                <li>Detect potential fraud through our AuditFlow risk scoring system</li>
                <li>Generate summaries, reports, and export files for your claims workflows</li>
                <li>Authenticate your identity and manage your account</li>
                <li>Send service notifications, security alerts, and operational updates</li>
                <li>Improve our platform through aggregated, de-identified analytics</li>
                <li>Comply with legal obligations, including HIPAA requirements</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4">3. Protected Health Information (PHI) Under HIPAA</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Our Role</h3>
              <p className="text-gray-700 mb-4">
                ClarifyOps operates as a Business Associate under HIPAA when processing PHI on behalf of Covered Entities. 
                We enter into Business Associate Agreements (BAAs) with our customers who are Covered Entities or their 
                Business Associates.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 PHI Safeguards</h3>
              <p className="text-gray-700 mb-4">We implement the following safeguards for PHI:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Administrative:</strong> Security incident procedures and access management policies</li>
                <li><strong>Technical:</strong> AES-256 encryption for sensitive data fields, TLS encryption in transit, role-based access controls, 
                  automatic session expiration, and activity logging</li>
                <li><strong>Physical:</strong> Infrastructure hosted on DigitalOcean with data center physical 
                  access controls and environmental protections</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 PHI Auto-Redaction</h3>
              <p className="text-gray-700 mb-4">
                Our system automatically detects and redacts PHI identifiers (including SSNs, dates of birth, phone numbers, 
                member IDs, and medical record numbers) before sending data to external AI processing services to minimize 
                exposure of sensitive information.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.4 Minimum Necessary Standard</h3>
              <p className="text-gray-700 mb-4">
                We apply the HIPAA Minimum Necessary standard, limiting PHI access and disclosure to only what is needed 
                to fulfill the intended purpose of the processing.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">We may share information with the following categories of recipients:</p>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6 not-prose">
                <h4 className="font-semibold mb-4">Subprocessors</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Neon', purpose: 'PostgreSQL database hosting and automated backups' },
                    { name: 'DigitalOcean', purpose: 'Cloud infrastructure and server hosting' },
                    { name: 'OpenRouter', purpose: 'AI model access for claims processing (PHI redacted before transmission)' },
                    { name: "Let's Encrypt", purpose: 'SSL certificate provisioning' },
                    { name: 'Sentry', purpose: 'Error monitoring and performance tracking' }
                  ].map((sub) => (
                    <div key={sub.name} className="flex items-start gap-3">
                      <span className="font-medium text-gray-900 min-w-[120px]">{sub.name}:</span>
                      <span className="text-gray-600">{sub.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                We do <strong>not</strong> sell, rent, or trade your personal information or PHI to third parties for 
                marketing purposes. We do not use your data for advertising.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">We employ multiple layers of security to protect your data:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Encryption:</strong> AES-256 for sensitive data fields, TLS 1.2+ for data in transit, bcrypt for password storage</li>
                <li><strong>Access Control:</strong> Role-based access control with 6 distinct roles, JWT authentication with token expiration</li>
                <li><strong>Multi-Tenancy:</strong> Data isolation between organizations via tenant-scoped database queries</li>
                <li><strong>Audit Logging:</strong> Activity logging recording data access, modifications, and exports</li>
                <li><strong>Input Validation:</strong> Zod/Ajv schema validation and HTML sanitization to prevent injection attacks</li>
                <li><strong>Network Security:</strong> Security headers (Helmet.js), rate limiting, and nginx reverse proxy</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your data for as long as your account is active or as needed to provide services. 
                Claims data is retained according to your organization's configured retention policies. 
                Upon account termination, we will delete or de-identify your data within 90 days, unless 
                a longer retention period is required by law or regulation.
              </p>
              <p className="text-gray-700 mb-4">
                Audit logs are retained for a minimum of 6 years to comply with HIPAA retention requirements.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">7. Your Rights</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">7.1 General Rights</h3>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate personal information</li>
                <li>Request deletion of your personal data (subject to legal retention requirements)</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent for optional data processing</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.2 HIPAA Rights</h3>
              <p className="text-gray-700 mb-4">
                If you are a patient whose PHI is processed through our platform, your rights regarding your PHI are 
                governed by HIPAA and should be exercised through the Covered Entity (your healthcare provider or insurer) 
                that originally collected your information.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.3 GDPR Rights (EU Residents)</h3>
              <p className="text-gray-700 mb-4">
                If you are located in the European Union, you have additional rights under GDPR including the right to 
                data portability, the right to restrict processing, and the right to lodge a complaint with a supervisory authority.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use essential cookies for authentication (JWT tokens stored in browser local storage) and session management. 
                We use Sentry for error tracking and Prometheus for performance monitoring. We do not use third-party advertising 
                trackers or sell data to advertising networks.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                ClarifyOps is not directed at individuals under the age of 18. We do not knowingly collect personal 
                information from children. If we learn that we have collected information from a child under 18, we will 
                take steps to delete it promptly.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Our services are hosted in the United States. If you access ClarifyOps from outside the United States, 
                your data will be transferred to and processed in the United States. We take appropriate measures to ensure 
                your data is treated securely and in accordance with this Privacy Policy and applicable data protection laws.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">11. Breach Notification</h2>
              <p className="text-gray-700 mb-4">
                In the event of a data breach involving PHI, we will notify affected Covered Entities without unreasonable 
                delay and no later than 60 days after discovery, as required by HIPAA. We will also notify the U.S. Department 
                of Health and Human Services and, where required, affected individuals and the media.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting 
                the updated policy on our website and updating the "Last updated" date. Your continued use of our services 
                after changes are posted constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4">13. Contact Us</h2>
              <div className="bg-gray-50 rounded-xl p-6 not-prose">
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Privacy Inquiries:</strong> <a href="mailto:privacy@clarifyops.com" className="text-indigo-600 hover:underline">privacy@clarifyops.com</a></p>
                  <p><strong>Security Team:</strong> <a href="mailto:security@clarifyops.com" className="text-indigo-600 hover:underline">security@clarifyops.com</a></p>
                  <p><strong>General Support:</strong> <a href="mailto:support@clarifyops.com" className="text-indigo-600 hover:underline">support@clarifyops.com</a></p>
                </div>
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
            <Link to="/trust" className="hover:text-white transition-colors">Trust Center</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
