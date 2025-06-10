export default function TenantSwitcher({ tenant, onChange }) {
  const tenants = ['default', 'acme', 'globex'];
  return (
    <select
      value={tenant}
      onChange={(e) => onChange(e.target.value)}
      className="ml-2 border rounded p-1 text-sm"
    >
      {tenants.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
