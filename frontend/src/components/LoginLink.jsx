import React from 'react';
import { useLocation } from 'react-router-dom';
import { logEvent, getRequestId } from '../lib/analytics';

export default function LoginLink({ children, source, method = 'password', onClick, ...props }) {
  const { pathname, search } = useLocation();
  const next = encodeURIComponent(pathname + (search || ''));
  const href = `/login?next=${next}`;
  const handleClick = (e) => {
    logEvent('login_click', { source, request_id: getRequestId(), method });
    if (onClick) onClick(e);
  };
  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
