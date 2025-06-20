import React, { useEffect, useState } from 'react';
import WorkflowBuilder from './components/WorkflowBuilder';
import RuleBuilder from './components/RuleBuilder';
import MainLayout from './components/MainLayout';

export default function WorkflowPage() {
  const token = localStorage.getItem('token') || '';
  const [steps, setSteps] = useState(['Finance', 'Manager', 'Legal']);
  const [rules, setRules] = useState(() => {
    const saved = localStorage.getItem('workflowRules');
    return saved
      ? JSON.parse(saved)
      : [
          { condition: 'Amount > $500', action: 'require approver', active: true },
          { condition: 'PDF + OCR', action: 'auto-suggest tags', active: true },
        ];
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

  const saveRules = (newRules) => {
    setRules(newRules);
    localStorage.setItem('workflowRules', JSON.stringify(newRules));
  };

  return (
    <MainLayout title="Workflow Builder">
      <div className="space-y-6 max-w-md">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Approval Chain</h2>
          <WorkflowBuilder steps={steps} onChange={save} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Rules</h2>
          <RuleBuilder rules={rules} onChange={saveRules} />
        </div>
      </div>
    </MainLayout>
  );
}
