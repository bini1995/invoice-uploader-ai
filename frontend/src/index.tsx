import React, { Suspense, lazy } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import ErrorBoundary from './ErrorBoundary';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { API_BASE } from './api';
import { getRequestId } from './lib/analytics';
import { queueOfflineRequest, startOfflineSync } from './lib/offlineSync';

const LandingPage = lazy(() => import('./LandingPage'));
const ClaimsPage = lazy(() => import('./Claims'));
const OperationsDashboard = lazy(() => import('./OperationsDashboard'));
const AdaptiveDashboard = lazy(() => import('./AdaptiveDashboard'));
const SharedDashboard = lazy(() => import('./SharedDashboard'));
const DashboardBuilder = lazy(() => import('./DashboardBuilder'));
const ExportTemplateBuilder = lazy(() => import('./ExportTemplateBuilder'));
const AISpendAnalyticsHub = lazy(() => import('./AISpendAnalyticsHub'));
const AuditFlow = lazy(() => import('./AuditFlow'));
const FraudReport = lazy(() => import('./FraudReport'));
const HumanReview = lazy(() => import('./HumanReview'));
const Archive = lazy(() => import('./Archive'));
const TeamManagement = lazy(() => import('./TeamManagement'));
const VendorManagement = lazy(() => import('./VendorManagement'));
const WorkflowPage = lazy(() => import('./WorkflowPage'));
const WorkflowBuilderPage = lazy(() => import('./WorkflowBuilderPage'));
const Board = lazy(() => import('./Board'));
const KanbanDashboard = lazy(() => import('./KanbanDashboard'));
const NotFound = lazy(() => import('./NotFound'));
const ResultsViewer = lazy(() => import('./ResultsViewer'));
const SecurityPage = lazy(() => import('./SecurityPage'));
const OnboardingWizard = lazy(() => import('./OnboardingWizard'));
const MultiUploadWizard = lazy(() => import('./MultiUploadWizard'));
const BatchUpload = lazy(() => import('./BatchUpload'));
const ClaimSearch = lazy(() => import('./ClaimSearch'));
const DemoSandbox = lazy(() => import('./DemoSandbox'));
const PreparedClaimReport = lazy(() => import('./PreparedClaimReport'));
const InstantTrial = lazy(() => import('./InstantTrial'));
const LoginPage = lazy(() => import('./LoginPage'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const SignUp = lazy(() => import('./SignUp'));
const Profile = lazy(() => import('./Profile'));
const SSOCallback = lazy(() => import('./SSOCallback'));
const DocsPage = lazy(() => import('./DocsPage'));
const ClarifyClaims = lazy(() => import('./ClarifyClaims'));
const ClaimsBrandingPreview = lazy(() => import('./ClaimsBrandingPreview'));
const DeliverySettings = lazy(() => import('./DeliverySettings'));
const ComparisonPage = lazy(() => import('./ComparisonPage.jsx'));
const IntegrationsPage = lazy(() => import('./IntegrationsPage.jsx'));
const UseCasesPage = lazy(() => import('./UseCasesPage.jsx'));
const TrustCenter = lazy(() => import('./TrustCenter'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));
const TermsOfService = lazy(() => import('./TermsOfService'));
const CaseStudies = lazy(() => import('./CaseStudies'));
const BillingPage = lazy(() => import('./BillingPage'));

/**
 * Global fetch wrapper to route API requests to configured backend.
 * 401 responses from URLs containing '/login' do NOT cause automatic redirect
 * or token removal; this allows credential errors to surface on the login page.
 */
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  let finalUrl = '';
  if (typeof url === 'string') {
    finalUrl = url;
  } else if (url instanceof Request) {
    finalUrl = url.url;
  } else if (url instanceof URL) {
    finalUrl = url.href;
  }

  const tenant = localStorage.getItem('tenant') || 'default';
  if (finalUrl.startsWith('http://localhost:3000')) {
    finalUrl = finalUrl.replace('http://localhost:3000', API_BASE);
  }
  
  if (finalUrl.startsWith(API_BASE)) {
    let path = finalUrl.slice(API_BASE.length);
    if (path.startsWith('/api/export-templates')) {
      path = path.replace('/api/export-templates', `/api/${tenant}/export-templates`);
    }
    finalUrl = API_BASE + path;
  } else if (finalUrl.startsWith('/')) {
    if (finalUrl.startsWith('/api/export-templates')) {
      finalUrl = finalUrl.replace('/api/export-templates', `/api/${tenant}/export-templates`);
    }
    finalUrl = `${API_BASE}${finalUrl}`;
  }

  options.headers = { ...(options.headers || {}), 'X-Request-Id': getRequestId() };

  if (method !== 'GET' && !navigator.onLine) {
    const queued = await queueOfflineRequest(finalUrl, options);
    if (queued) {
      return new Response(JSON.stringify({ queued: true, offline: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const res = await originalFetch(finalUrl, options);
  
  const finalUrlStr = String(finalUrl);
  const isLoginRequest = finalUrlStr.includes('/login') || finalUrlStr.includes('/api/auth/login');
  if (res.status === 401 && !isLoginRequest) {
    localStorage.removeItem('token');
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    localStorage.setItem('sessionExpired', '1');
    window.location.href = `/login?next=${next}`;
  } else if (res.status === 403 && !isLoginRequest) {
    console.warn(`No access to tenant ${tenant}`);
  }
  return res;
};

const currentTenant = localStorage.getItem('tenant') || 'default';
const savedTheme = localStorage.getItem(`themeMode_${currentTenant}`) || localStorage.getItem('theme');
const planType = (localStorage.getItem('planType') || localStorage.getItem('plan') || '').toLowerCase();
const canUseDarkMode = planType === 'pro';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const shouldApplyDark =
  canUseDarkMode && (savedTheme === 'dark' || ((!savedTheme || savedTheme === 'system') && prefersDark));

if (shouldApplyDark) {
  document.documentElement.classList.add('dark');
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme', 'light');
}
const savedContrast = localStorage.getItem('contrast');
if (savedContrast === 'high') {
  document.documentElement.classList.add('high-contrast');
}
const savedAccent = localStorage.getItem(`accentColor_${currentTenant}`);
if (savedAccent) {
  document.documentElement.style.setProperty('--cta-bg', savedAccent);
  document.documentElement.style.setProperty('--cta-hover', savedAccent);
  document.documentElement.style.setProperty('--cta-active', savedAccent);
  document.documentElement.style.setProperty('--focus-ring-color', savedAccent);
}
const savedFont = localStorage.getItem(`fontFamily_${currentTenant}`);
if (savedFont) document.documentElement.style.setProperty('--font-ui', savedFont);

if (API_BASE) {
  fetch(`${API_BASE}/api/health`).catch((err) => {
    console.error('API connection failed', err);
  });
}
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container is missing.');
}

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/operations" element={<PageWrapper><OperationsDashboard /></PageWrapper>} />
        <Route path="/adaptive" element={<PageWrapper><AdaptiveDashboard /></PageWrapper>} />
        <Route path="/dashboard/shared/:token" element={<PageWrapper><SharedDashboard /></PageWrapper>} />
        <Route path="/claims" element={<PageWrapper><ClaimsPage /></PageWrapper>} />
        <Route path="/claims/branding-preview" element={<PageWrapper><ClaimsBrandingPreview /></PageWrapper>} />
        <Route path="/analytics" element={<PageWrapper><AISpendAnalyticsHub /></PageWrapper>} />
        <Route path="/auditflow" element={<PageWrapper><AuditFlow /></PageWrapper>} />
        <Route path="/fraud" element={<PageWrapper><FraudReport /></PageWrapper>} />
        <Route path="/review" element={<PageWrapper><HumanReview /></PageWrapper>} />
        <Route path="/delivery" element={<PageWrapper><DeliverySettings /></PageWrapper>} />
        <Route path="/billing" element={<PageWrapper><BillingPage /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><TeamManagement /></PageWrapper>} />
        <Route path="/archive" element={<PageWrapper><Archive /></PageWrapper>} />
        <Route path="/vendors" element={<PageWrapper><VendorManagement /></PageWrapper>} />
        <Route path="/workflow" element={<PageWrapper><WorkflowPage /></PageWrapper>} />
        <Route path="/workflow-builder" element={<PageWrapper><WorkflowBuilderPage /></PageWrapper>} />
        <Route path="/board" element={<PageWrapper><Board /></PageWrapper>} />
        <Route path="/kanban" element={<PageWrapper><KanbanDashboard /></PageWrapper>} />
        <Route path="/builder" element={<PageWrapper><DashboardBuilder /></PageWrapper>} />
        <Route path="/export-builder" element={<PageWrapper><ExportTemplateBuilder /></PageWrapper>} />
        <Route path="/upload-wizard" element={<PageWrapper><MultiUploadWizard /></PageWrapper>} />
        <Route path="/batch-upload" element={<PageWrapper><BatchUpload /></PageWrapper>} />
        <Route path="/search" element={<PageWrapper><ClaimSearch /></PageWrapper>} />
        <Route path="/onboarding" element={<PageWrapper><OnboardingWizard /></PageWrapper>} />
        <Route path="/sandbox" element={<PageWrapper><DemoSandbox /></PageWrapper>} />
        <Route path="/free-trial" element={<PageWrapper><InstantTrial /></PageWrapper>} />
        <Route path="/claims/summary" element={<PageWrapper><ClarifyClaims /></PageWrapper>} />
        <Route path="/claim/:id" element={<PageWrapper><PreparedClaimReport /></PageWrapper>} />
        <Route path="/results/:id" element={<PageWrapper><ResultsViewer /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignUp onLogin={() => {}} addToast={(msg) => console.log(msg)} /></PageWrapper>} />
        <Route path="/sso-callback" element={<PageWrapper><SSOCallback /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile addToast={(msg) => console.log(msg)} /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/security" element={<PageWrapper><SecurityPage /></PageWrapper>} />
        <Route path="/compare" element={<PageWrapper><ComparisonPage /></PageWrapper>} />
        <Route path="/integrations" element={<PageWrapper><IntegrationsPage /></PageWrapper>} />
        <Route path="/use-cases" element={<PageWrapper><UseCasesPage /></PageWrapper>} />
        <Route path="/use-cases/:caseId" element={<PageWrapper><UseCasesPage /></PageWrapper>} />
        <Route path="/case-studies" element={<PageWrapper><CaseStudies /></PageWrapper>} />
        <Route path="/trust" element={<PageWrapper><TrustCenter /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsOfService /></PageWrapper>} />
        <Route path="/docs" element={<PageWrapper><DocsPage /></PageWrapper>} />
        <Route path="/docs/:section" element={<PageWrapper><DocsPage /></PageWrapper>} />
        <Route path="/app" element={<Navigate to="/claims" replace />} />
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

  const app = (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );

  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }

serviceWorkerRegistration.unregister();

startOfflineSync();
