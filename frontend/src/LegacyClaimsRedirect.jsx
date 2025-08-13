import { Navigate, useLocation } from 'react-router-dom';

export default function LegacyClaimsRedirect() {
  const location = useLocation();
  // guard against redirect loops
  if (location.pathname.startsWith('/claims')) return null;
  const suffix = location.pathname.replace(/^\/opsclaim/, '');
  const target = `/claims${suffix}${location.search}${location.hash}`;
  return <Navigate to={target} replace />;
}
