import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import { API_BASE } from './api';
import { Button } from './components/ui/Button';
import ButtonDropdown, { MenuItem } from './components/ButtonDropdown';
import ExtractionFeedback from './components/ExtractionFeedback';

export default function ResultsViewer() {
  const { id } = useParams();
  const token = localStorage.getItem('token') || '';
  const [fields, setFields] = useState({});
  const [status, setStatus] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [flags, setFlags] = useState({});
  const [flagReasons, setFlagReasons] = useState({});
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/claims/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setFields(data.fields || {});
        if (data.status) setStatus(data.status);
      })
      .catch((err) => console.error('Load fields failed', err));
  }, [id, token]);

  const sendPatch = async () => {
    if (!editingField) return;
    try {
      const res = await fetch(`${API_BASE}/api/claims/${id}/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [editingField]: editingValue })
      });
      if (res.ok) {
        setFields((prev) => ({ ...prev, [editingField]: editingValue }));
        setStatus('User Edited');
      }
    } catch (err) {
      console.error('Save field failed:', err);
    }
  };

  const handleSave = async () => {
    await sendPatch();
    setEditingField(null);
    setEditingValue('');
  };

  useEffect(() => {
    if (!editingField) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      sendPatch();
    }, 1000);
    return () => clearTimeout(saveTimer.current);
  }, [editingValue, editingField, sendPatch]);

  const handleReextract = async (mode) => {
    try {
      const query = mode === 'clear' ? '?clear=1' : '';
      const res = await fetch(
        `${API_BASE}/api/claims/${id}/extract-fields${query}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (res.ok && data.fields) {
        setFields(data.fields);
        setStatus('AI Results Available');
      }
    } catch (err) {
      console.error('Re-extract failed', err);
    }
  };

  const toggleFlag = (field, reason) => {
    setFlags((prev) => ({ ...prev, [field]: !prev[field] }));
    if (reason) {
      setFlagReasons((prev) => ({ ...prev, [field]: reason }));
    }
  };

  const categoryMap = {
    claimNumber: 'Header Info',
    dateOfLoss: 'Header Info',
    policyholder: 'Header Info',
    policyType: 'Coverage Info',
    coverageAmount: 'Coverage Info',
    location: 'Incident Details',
    description: 'Incident Details'
  };

  const categorized = {};
  Object.entries(fields).forEach(([field, value]) => {
    const flagCat = flags[field] ? 'Flagged' : null;
    const category = flagCat || categoryMap[field] || 'Other';
    if (!categorized[category]) categorized[category] = [];
    categorized[category].push([field, value]);
  });
  const orderedCategories = ['Header Info', 'Coverage Info', 'Incident Details', 'Other', 'Flagged'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Extraction Results</h1>
            {status && (
              <span
                className={`text-xs px-2 py-1 rounded ${
                  status === 'Awaiting Extraction'
                    ? 'bg-gray-200 text-gray-800'
                    : status === 'AI Results Available'
                    ? 'bg-blue-200 text-blue-800'
                    : status === 'User Edited'
                    ? 'bg-green-200 text-green-800'
                    : status === 'Flagged'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {status}
              </span>
            )}
          </div>
          <ButtonDropdown label="Re-extract AI Fields">
            <MenuItem onClick={() => handleReextract('latest')}>
              Use latest AI model
            </MenuItem>
            <MenuItem onClick={() => handleReextract('clear')}> 
              Clear fields &amp; re-extract
            </MenuItem>
          </ButtonDropdown>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Field</th>
                <th className="border px-2 py-1">Value</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderedCategories.map(
                (cat) =>
                  categorized[cat] && (
                    <React.Fragment key={cat}>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="font-semibold px-2 py-1">
                          {cat}
                        </td>
                      </tr>
                      {categorized[cat].map(([field, value]) => (
                        <tr key={field} className="hover:bg-gray-50">
                          <td className="border px-2 py-1 font-medium">
                            {field}
                          </td>
                          <td
                            className="border px-2 py-1 cursor-pointer"
                            onClick={() => {
                              setEditingField(field);
                              setEditingValue(value);
                            }}
                          >
                            {editingField === field ? (
                              <div className="flex gap-2 items-center">
                                <input
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="input text-sm w-full px-1"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={handleSave}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            ) : (
                              value
                            )}
                          </td>
                          <td className="border px-2 py-1 text-center">
                            <ButtonDropdown label="Flag options">
                              <MenuItem
                                onClick={() => toggleFlag(field, 'Inaccurate')}
                              >
                                Inaccurate
                              </MenuItem>
                              <MenuItem
                                onClick={() => toggleFlag(field, 'Missing')}
                              >
                                Missing
                              </MenuItem>
                              <MenuItem
                                onClick={() => toggleFlag(field, 'Not applicable')}
                              >
                                Not applicable
                              </MenuItem>
                              <MenuItem
                                onClick={() => toggleFlag(field, 'Needs manager review')}
                              >
                                Needs manager review
                              </MenuItem>
                            </ButtonDropdown>
                            {flags[field] && (
                              <span className="ml-2 text-xs text-red-600">
                                {flagReasons[field] || 'Flagged'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
              )}
            </tbody>
          </table>
        </div>
        <ExtractionFeedback documentId={id} initialStatus={status} />
      </div>
    </div>
  );
}
