import React, { useState, useEffect } from 'react';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import PageHeader from './components/PageHeader';

const FIELDS = ['id','invoice_number','date','amount','vendor','created_at','assignee','tags'];

export default function ExportTemplateBuilder() {
  const token = localStorage.getItem('token') || '';
  const tenant = localStorage.getItem('tenant') || 'default';
  const [name,setName] = useState('');
  const [fields,setFields] = useState(() => Object.fromEntries(FIELDS.map(f => [f,true])));
  const [templates, setTemplates] = useState([]);

  const fetchTemplates = () => {
    fetch(`/api/${tenant}/export-templates`, { headers:{ Authorization:`Bearer ${token}` }})
      .then(r=>r.json()).then(d=>setTemplates(d.templates||[])).catch(()=>{});
  };

  useEffect(fetchTemplates, [tenant, token]);

  const toggle = f => setFields(prev => ({...prev,[f]:!prev[f]}));

  const save = async () => {
    const cols = Object.keys(fields).filter(k=>fields[k]);
    await fetch(`/api/${tenant}/export-templates`, {
      method:'POST',
      headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: JSON.stringify({ name, columns: cols })
    });
    setName('');
    fetchTemplates();
  };

  const download = (id) => {
    window.location = `/api/${tenant}/export-templates/${id}/export`;
  };

  return (
    <ImprovedMainLayout title="Export Templates">
      <div className="space-y-4 max-w-xl">
        <PageHeader title="ClarifyOps" subtitle="Export Templates" />
        <p className="text-sm text-gray-500">
          Select which fields to include in your export template.
        </p>
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-2">Export Template Fields</h2>
          <p className="text-sm text-gray-500 mb-4">
            Select which fields to include.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template Name"
            className="input w-full"
          />
          <div className="flex flex-wrap gap-2">
            {FIELDS.map((f) => (
              <label key={f} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={fields[f]}
                  onChange={() => toggle(f)}
                />{' '}
                {f}
              </label>
            ))}
          </div>
          <button
            onClick={save}
            className="btn btn-primary mt-2 px-3 py-1"
          >
            Save
          </button>
        </div>
        <ul className="list-disc pl-5">
          {templates.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <span>{t.name}</span>
              <button
                onClick={() => download(t.id)}
                className="underline text-sm"
              >
                Export
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ImprovedMainLayout>
  );
}
