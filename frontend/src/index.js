import React from 'react';
import ReactDOM from 'react-dom/client';
import ClaimsPage from './Claims';
import OperationsDashboard from './OperationsDashboard';
import AdaptiveDashboard from './AdaptiveDashboard';
import SharedDashboard from './SharedDashboard';
import DashboardBuilder from './DashboardBuilder';
import ExportTemplateBuilder from './ExportTemplateBuilder';
import AISpendAnalyticsHub from './AISpendAnalyticsHub';
import AuditDashboard from './AuditDashboard';
import FraudReport from './FraudReport';
import HumanReview from './HumanReview';
import Archive from './Archive';
import TeamManagement from './TeamManagement';
import VendorManagement from './VendorManagement';
import WorkflowPage from './WorkflowPage';
import WorkflowBuilderPage from './WorkflowBuilderPage';
import Board from './Board';
import KanbanDashboard from './KanbanDashboard';
import Inbox from './Inbox';
import NotFound from './NotFound';
import ResultsViewer from './ResultsViewer';
import ErrorBoundary from './ErrorBoundary';
import LandingPage from './LandingPage.jsx';
import OnboardingWizard from './OnboardingWizard';
import MultiUploadWizard from './MultiUploadWizard';
import DemoSandbox from './DemoSandbox';
import InstantTrial from './InstantTrial';
import LoginPage from './LoginPage';
import DocsPage from './DocsPage';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { API_BASE } from './api';

// Global fetch wrapper to route API requests to configured backend
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (typeof url === 'string') {
    const tenant = localStorage.getItem('tenant') || 'default';
    if (url.startsWith('http://localhost:3000')) {
      url = url.replace('http://localhost:3000', API_BASE);
    }
    if (url.startsWith(API_BASE)) {
      let path = url.slice(API_BASE.length);
      if (path.startsWith('/api/invoices')) {
        path = path.replace('/api/invoices', '/api/claims');
      } else if (path.startsWith('/api/export-templates')) {
        path = path.replace('/api/export-templates', `/api/${tenant}/export-templates`);
      }
      url = API_BASE + path;
    } else if (url.startsWith('/')) {
      if (url.startsWith('/api/invoices')) {
        url = url.replace('/api/invoices', '/api/claims');
      } else if (url.startsWith('/api/export-templates')) {
        url = url.replace('/api/export-templates', `/api/${tenant}/export-templates`);
      }
      url = `${API_BASE}${url}`;
    }
  }
  const res = await originalFetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem('token');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
  return res;
};

const currentTenant = localStorage.getItem('tenant') || 'default';
const savedTheme = localStorage.getItem(`themeMode_${currentTenant}`);
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}
const savedContrast = localStorage.getItem('contrast');
if (savedContrast === 'high') {
  document.documentElement.classList.add('high-contrast');
}
const savedAccent = localStorage.getItem(`accentColor_${currentTenant}`);
if (savedAccent) document.documentElement.style.setProperty('--accent-color', savedAccent);
const savedFont = localStorage.getItem(`fontFamily_${currentTenant}`);
if (savedFont) document.documentElement.style.setProperty('--font-base', savedFont);

if (API_BASE) {
  // Hit the health endpoint instead of /api/claims since the
  // claims listing route may not exist in some deployments.
  fetch(`${API_BASE}/health`).catch((err) => {
    console.error('API connection failed', err);
  });
}
const root = ReactDOM.createRoot(document.getElementById('root'));
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
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
        <Route path="/inbox" element={<PageWrapper><Inbox /></PageWrapper>} />
        <Route path="/analytics" element={<PageWrapper><AISpendAnalyticsHub /></PageWrapper>} />
        <Route path="/audit" element={<PageWrapper><AuditDashboard /></PageWrapper>} />
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
        <Route path="/docs" element={<PageWrapper><DocsPage /></PageWrapper>} />
        <Route path="/results/:id" element={<PageWrapper><ResultsViewer /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

root.render(
  <BrowserRouter>
    <ErrorBoundary>
      <AnimatedRoutes />
    </ErrorBoundary>
  </BrowserRouter>
);

// disable service worker to avoid registration errors
serviceWorkerRegistration.unregister();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
