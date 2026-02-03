import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SSOCallback({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const role = searchParams.get('role');
    const name = searchParams.get('name');
    const email = searchParams.get('email');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', role);
      if (name) localStorage.setItem('userName', name);
      if (email) localStorage.setItem('userEmail', email);
      
      if (onLogin) {
        onLogin(token, role);
      }
      
      navigate('/operations');
    } else {
      setError('Authentication failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, onLogin, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-300">Completing sign in...</p>
      </div>
    </div>
  );
}
