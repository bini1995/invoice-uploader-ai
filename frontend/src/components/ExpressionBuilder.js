import React, { useState, useEffect } from 'react';

const FIELDS = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'amount', label: 'Amount' },
  { value: 'department', label: 'Department' },
];

const OPS = [
  { value: 'equals', label: '=' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
];

export default function ExpressionBuilder({ expression = [], onChange }) {
  const [conditions, setConditions] = useState(expression);

  useEffect(() => {
    onChange && onChange(conditions);
  }, [conditions, onChange]);

  const addCondition = () => {
    setConditions([...conditions, { field: 'vendor', op: 'equals', value: '' }]);
  };

  const update = (idx, key, value) => {
    const updated = conditions.map((c, i) =>
      i === idx ? { ...c, [key]: value } : c
    );
    setConditions(updated);
  };

  const remove = (idx) => {
    const updated = conditions.filter((_, i) => i !== idx);
    setConditions(updated);
  };

  return (
    <div className="space-y-2">
      {conditions.map((c, i) => (
        <div key={i} className="flex space-x-2 items-center">
          <select
            className="border rounded p-1 bg-white dark:bg-gray-800"
            value={c.field}
            onChange={(e) => update(i, 'field', e.target.value)}
          >
            {FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-1 bg-white dark:bg-gray-800"
            value={c.op}
            onChange={(e) => update(i, 'op', e.target.value)}
          >
            {OPS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            className="border rounded p-1 flex-1 bg-white dark:bg-gray-800"
            value={c.value}
            onChange={(e) => update(i, 'value', e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-600 px-2"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addCondition}
        className="px-2 py-1 bg-blue-500 text-white rounded"
      >
        Add Condition
      </button>
    </div>
  );
}
