import React, { useEffect, useState } from 'react';
import WorkflowBuilder from './components/WorkflowBuilder';
import SidebarNav from './components/SidebarNav';

export default function WorkflowPage() {
  const token = localStorage.getItem('token') || '';
  const [steps, setSteps] = useState(['Finance', 'Manager', 'Legal']);
  const [notifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/workflows', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      if (d.workflows && d.workflows[0]) setSteps(d.workflows[0].approval_chain);
    }).catch(() => {});
  }, [token]);

  const save = async (newSteps) => {
    setSteps(newSteps);
    await fetch('http://localhost:3000/api/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ department: 'default', approval_chain: newSteps })
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SidebarNav notifications={notifications} />
      <div className="flex-1 p-4">
        <h1 className="text-xl font-semibold mb-4">Workflow Builder</h1>
        <WorkflowBuilder steps={steps} onChange={save} />
      </div>
    </div>
  );
}
