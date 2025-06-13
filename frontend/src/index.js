import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Dashboard from './Dashboard';
import Reports from './Reports';
import Archive from './Archive';
import TeamManagement from './TeamManagement';
import VendorManagement from './VendorManagement';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const apiBase = process.env.REACT_APP_API_BASE_URL || '';
if (apiBase) {
  fetch(`${apiBase}/api/invoices`).catch((err) => {
    console.error('API connection failed', err);
  });
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/invoices" element={<App />} />
      <Route path="/insights" element={<Reports />} />
      <Route path="/settings" element={<TeamManagement />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/vendors" element={<VendorManagement />} />
      <Route path="/" element={<Navigate to="/invoices" replace />} />
    </Routes>
  </BrowserRouter>
);

// register service worker for offline support
serviceWorkerRegistration.unregister();


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
