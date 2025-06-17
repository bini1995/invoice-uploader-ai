import React, { useEffect, useState } from 'react';
import WorkflowBuilder from './components/WorkflowBuilder';
import MainLayout from './components/MainLayout';

export default function WorkflowPage() {
  const token = localStorage.getItem('token') || '';
  const [steps, setSteps] = useState(['Finance', 'Manager', 'Legal']);

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
    <MainLayout title="Workflow Builder">
      <WorkflowBuilder steps={steps} onChange={save} />
    </MainLayout>
  );
}
