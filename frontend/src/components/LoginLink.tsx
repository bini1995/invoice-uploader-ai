import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { logEvent, getRequestId } from '../lib/analytics';

export default function LoginLink({ children, source, method = 'password', onClick = undefined, ...props }) {
  const { pathname, search } = useLocation();
  const next = encodeURIComponent(pathname + (search || ''));
  const to = `/login?next=${next}`;
  const handleClick = (e) => {
    logEvent('login_click', { source, request_id: getRequestId(), method });
    if (onClick) onClick(e);
  };
  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
