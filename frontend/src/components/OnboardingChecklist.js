import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Card } from './ui/Card';

export default function OnboardingChecklist() {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('onboardingChecklist');
    return (
      JSON.parse(stored) || [
        { id: 'upload', label: 'Upload your first document', done: false },
        { id: 'invite', label: 'Invite a teammate', done: false },
        { id: 'budget', label: 'Set up a budget', done: false },
      ]
    );
  });

  const toggle = (id) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, done: !i.done } : i
      );
      localStorage.setItem('onboardingChecklist', JSON.stringify(next));
      return next;
    });
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-2">Onboarding Checklist</h2>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={item.done}
              onChange={() => toggle(item.id)}
            />
            <span className={item.done ? 'line-through text-gray-500' : ''}>
              {item.label}
            </span>
            {item.done && <CheckIcon className="w-4 h-4 text-green-600 ml-1" />}
          </li>
        ))}
      </ul>
    </Card>
  );
}
