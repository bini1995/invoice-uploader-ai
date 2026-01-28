import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import ClaimsPage from './Claims';
import OperationsDashboard from './OperationsDashboard';
import AdaptiveDashboard from './AdaptiveDashboard';
import SharedDashboard from './SharedDashboard';
import DashboardBuilder from './DashboardBuilder';
import ExportTemplateBuilder from './ExportTemplateBuilder';
import AISpendAnalyticsHub from './AISpendAnalyticsHub';
import AuditFlow from './AuditFlow';
import FraudReport from './FraudReport';
import HumanReview from './HumanReview';
import Archive from './Archive';
import TeamManagement from './TeamManagement';
import VendorManagement from './VendorManagement';
import WorkflowPage from './WorkflowPage';
import WorkflowBuilderPage from './WorkflowBuilderPage';
import Board from './Board';
import KanbanDashboard from './KanbanDashboard';
import NotFound from './NotFound';
import ResultsViewer from './ResultsViewer';
import ErrorBoundary from './ErrorBoundary';
import LandingPage from './LandingPage';
import SecurityPage from './SecurityPage';
import OnboardingWizard from './OnboardingWizard';
import MultiUploadWizard from './MultiUploadWizard';
import DemoSandbox from './DemoSandbox';
import InstantTrial from './InstantTrial';
import LoginPage from './LoginPage';
import ClarifyClaims from './ClarifyClaims';
import ClaimsBrandingPreview from './ClaimsBrandingPreview';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { API_BASE } from './api';
import { getRequestId } from './lib/analytics';
import { queueOfflineRequest, startOfflineSync } from './lib/offlineSync';

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

  let res: Response;
  try {
    res = await originalFetch(finalUrl, options);
  } catch (error) {
    if (method !== 'GET') {
      const queued = await queueOfflineRequest(finalUrl, options);
      if (queued) {
        return new Response(JSON.stringify({ queued: true, offline: true }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    throw error;
  }
  
  // Only handle 401 for non-login requests
  const finalUrlStr = String(finalUrl);
  const isLoginRequest = finalUrlStr.includes('/login') || finalUrlStr.includes('/api/auth/login');
  if (res.status === 401 && !isLoginRequest) {
    localStorage.removeItem('token');
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    localStorage.setItem('sessionExpired', '1');
    window.location.href = `/login?next=${next}`;
  } else if (res.status === 403 && !isLoginRequest) {
    alert(`No access to tenant ${tenant}`);
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
  // Hit the health endpoint instead of /api/claims since the
  // claims listing route may not exist in some deployments.
  fetch(`${API_BASE}/api/health`).catch((err) => {
    console.error('API connection failed', err);
  });
}
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container is missing.');
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
        <Route path="/onboarding" element={<PageWrapper><OnboardingWizard /></PageWrapper>} />
        <Route path="/sandbox" element={<PageWrapper><DemoSandbox /></PageWrapper>} />
        <Route path="/free-trial" element={<PageWrapper><InstantTrial /></PageWrapper>} />
        <Route path="/claims/summary" element={<PageWrapper><ClarifyClaims /></PageWrapper>} />
        <Route path="/results/:id" element={<PageWrapper><ResultsViewer /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/security" element={<PageWrapper><SecurityPage /></PageWrapper>} />
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
        <AnimatedRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );

  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }

serviceWorkerRegistration.register({
  onUpdate: () => {
    console.log('A new version is available. Refresh to update.');
  }
});

startOfflineSync(originalFetch);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
