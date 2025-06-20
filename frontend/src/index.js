import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Dashboard from './Dashboard';
import AdaptiveDashboard from './AdaptiveDashboard';
import SharedDashboard from './SharedDashboard';
import DashboardBuilder from './DashboardBuilder';
import ExportTemplateBuilder from './ExportTemplateBuilder';
import Reports from './Reports';
import AuditDashboard from './AuditDashboard';
import FraudReport from './FraudReport';
import Archive from './Archive';
import TeamManagement from './TeamManagement';
import VendorManagement from './VendorManagement';
import WorkflowPage from './WorkflowPage';
import WorkflowBuilderPage from './WorkflowBuilderPage';
import Board from './Board';
import NotFound from './NotFound';
import LandingPage from './LandingPage';
import OnboardingWizard from './OnboardingWizard';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const currentTenant = localStorage.getItem('tenant') || 'default';
const savedTheme = localStorage.getItem(`themeMode_${currentTenant}`);
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}
const savedAccent = localStorage.getItem(`accentColor_${currentTenant}`);
if (savedAccent) document.documentElement.style.setProperty('--accent-color', savedAccent);
const savedFont = localStorage.getItem(`fontFamily_${currentTenant}`);
if (savedFont) document.documentElement.style.setProperty('--font-base', savedFont);

const apiBase = process.env.REACT_APP_API_BASE_URL || '';
if (apiBase) {
  fetch(`${apiBase}/api/invoices`).catch((err) => {
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
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/adaptive" element={<PageWrapper><AdaptiveDashboard /></PageWrapper>} />
        <Route path="/dashboard/shared/:token" element={<PageWrapper><SharedDashboard /></PageWrapper>} />
        <Route path="/invoices" element={<PageWrapper><App /></PageWrapper>} />
        <Route path="/analytics" element={<PageWrapper><Reports /></PageWrapper>} />
        <Route path="/audit" element={<PageWrapper><AuditDashboard /></PageWrapper>} />
        <Route path="/fraud" element={<PageWrapper><FraudReport /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><TeamManagement /></PageWrapper>} />
        <Route path="/archive" element={<PageWrapper><Archive /></PageWrapper>} />
        <Route path="/vendors" element={<PageWrapper><VendorManagement /></PageWrapper>} />
        <Route path="/workflow" element={<PageWrapper><WorkflowPage /></PageWrapper>} />
        <Route path="/workflow-builder" element={<PageWrapper><WorkflowBuilderPage /></PageWrapper>} />
        <Route path="/board" element={<PageWrapper><Board /></PageWrapper>} />
        <Route path="/builder" element={<PageWrapper><DashboardBuilder /></PageWrapper>} />
        <Route path="/export-builder" element={<PageWrapper><ExportTemplateBuilder /></PageWrapper>} />
        <Route path="/onboarding" element={<PageWrapper><OnboardingWizard /></PageWrapper>} />
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

root.render(
  <BrowserRouter>
    <AnimatedRoutes />
  </BrowserRouter>
);

// register service worker for offline support
serviceWorkerRegistration.register();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
