import { useEffect, useState } from 'react';

export default function LiveFeed({ token, tenant }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/invoices/logs', {
          headers: { Authorization: `Bearer ${token}`, 'X-Tenant-Id': tenant }
        });
        const data = await res.json();
        if (isMounted) setLogs(data.slice(0, 20));
      } catch (err) {
        console.error('Feed fetch error:', err);
      }
    };

    fetchLogs();
    const id = setInterval(fetchLogs, 5000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [token, tenant]);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
      <h2 className="font-bold mb-2">Live Feed</h2>
      <ul className="space-y-1 text-sm max-h-60 overflow-auto">
        {logs.map((log) => (
          <li key={log.id} className="border-b border-gray-200 dark:border-gray-700 pb-1">
            {log.created_at}: {log.action} {log.invoice_id ? `#${log.invoice_id}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
