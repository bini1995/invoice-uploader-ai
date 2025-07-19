import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Toast from './components/Toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((text, type = 'success') => {
    const id = Date.now();
    const toast = { id, text, type };
    setToasts((t) => [...t, toast]);
    setTimeout(() => {
      setToasts((t) => t.filter((tt) => tt.id !== id));
    }, 3000);
  }, []);

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.text} type={t.type} />
        ))}
      </div>
      <Login
        onLogin={(tok, role) => {
          localStorage.setItem('token', tok);
          localStorage.setItem('role', role);
          navigate('/documents');
        }}
        addToast={addToast}
      />
    </div>
  );
}
