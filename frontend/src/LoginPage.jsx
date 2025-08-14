import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Toast from './components/Toast';

function sanitizeNext(raw) {
  if (!raw) return '/app';
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return '/app';
    if (!/^\/(app|claims|login|operations|adaptive|dashboard|settings|archive|vendors|workflow|board|kanban|builder|export-builder|upload-wizard|onboarding|sandbox|free-trial|results)/.test(url.pathname)) return '/app';
    return url.pathname + url.search;
  } catch {
    return '/app';
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = sanitizeNext(params.get('next') || params.get('RelayState'));
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((text, type = 'success', ariaLive = 'assertive') => {
    const id = Date.now();
    const toast = { id, text, type, ariaLive };
    setToasts((t) => [...t, toast]);
    setTimeout(() => {
      setToasts((t) => t.filter((tt) => tt.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('sessionExpired')) {
      addToast('Session expired—please log in again', 'error', 'polite');
      localStorage.removeItem('sessionExpired');
    }
  }, [addToast]);

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.text} type={t.type} ariaLive={t.ariaLive} />
        ))}
      </div>
      <Login
        next={next}
        onLogin={(tok, role) => {
          // TODO: move token storage to secure, HttpOnly cookies
          localStorage.setItem('token', tok);
          localStorage.setItem('role', role);
          navigate(next || '/app', { replace: true });
        }}
        addToast={addToast}
      />
    </div>
  );
}
