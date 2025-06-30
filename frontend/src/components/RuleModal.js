import React, { useState, useEffect } from 'react';

export default function RuleModal({ open, onClose, onSave, initial }) {
  const [type, setType] = useState('spend');
  const [amount, setAmount] = useState(1000);

  useEffect(() => {
    if (initial) {
      setType(initial.type || 'spend');
      setAmount(initial.amount || 1000);
    }
  }, [initial]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ type, amount });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg w-72 space-y-3">
        <h3 className="font-semibold">Define Rule</h3>
        <select value={type} onChange={e => setType(e.target.value)} className="input w-full">
          <option value="spend">Spend exceeds</option>
          <option value="newVendor">Vendor not seen before</option>
          <option value="pastDue">Invoice past due</option>
          <option value="duplicate">Duplicate invoice ID</option>
        </select>
        {type === 'spend' && (
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input w-full" />
        )}
        <div className="flex justify-end space-x-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
