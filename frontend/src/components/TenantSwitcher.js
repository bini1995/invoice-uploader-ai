export default function TenantSwitcher({ tenant, onChange }) {
  const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
  if (!demoMode) return null;

  const tenants = ['default', 'acme', 'globex'];
  return (
    <select
      value={tenant}
      onChange={(e) => onChange(e.target.value)}
      className="input ml-2 text-sm"
    >
      {tenants.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
