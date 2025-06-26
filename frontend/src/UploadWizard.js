import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import MainLayout from './components/MainLayout';
import PreviewModal from './components/PreviewModal';
import TagEditor from './components/TagEditor';
import SuggestionChips from './components/SuggestionChips';
import { Button } from './components/ui/Button';
import ProgressBar from './components/ProgressBar';
import { CircularProgress, Tooltip } from '@mui/material';
import { API_BASE } from './api';

export default function UploadWizard() {
  const token = localStorage.getItem('token') || '';
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [ext, setExt] = useState('');
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [previewModal, setPreviewModal] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fieldMap, setFieldMap] = useState({
    invoice_number: '',
    date: '',
    amount: '',
    vendor: '',
  });
  const required = ['invoice_number', 'date', 'amount', 'vendor'];

  const parseFile = async (fileObj) => {
    const ext = fileObj.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const text = await fileObj.text();
      const result = Papa.parse(text, { header: true });
      setHeaders(result.meta.fields || []);
      setRows(result.data);
    } else if (ext === 'pdf') {
      const form = new FormData();
      form.append('invoiceFile', fileObj);
      try {
        const res = await fetch(`${API_BASE}/api/invoices/parse-sample`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        const data = await res.json();
        if (res.ok && data.invoice) {
          setHeaders(Object.keys(data.invoice));
          setRows([data.invoice]);
        }
      } catch (e) {
        console.error('PDF parse failed', e);
      }
    } else if (ext === 'xls' || ext === 'xlsx') {
      const buf = await fileObj.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      setHeaders(Object.keys(data[0] || {}));
      setRows(data);
    }
  };

  const handleFile = (f) => {
    setErrors([]);
    setFile(f);
    const e = f.name.split('.').pop().toLowerCase();
    setExt(e);
    parseFile(f);
  };

  const handleSuggest = async (rowIdx) => {
    const invoice = rows[rowIdx];
    try {
      const res = await fetch(`${API_BASE}/api/invoices/suggest-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ invoice })
      });
      const data = await res.json();
      if (res.ok && data.tags) {
        setTagSuggestions(prev => ({ ...prev, [rowIdx]: data.tags }));
      }
    } catch (e) {
      console.error('Suggest tags failed', e);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => r[h]).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('invoiceFile', blob, file.name);
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/invoices/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      await res.json();
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const totalAmount = rows.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  useEffect(() => {
    if (step === 4) {
      rows.forEach((_, idx) => handleSuggest(idx));
    }
  }, [step]);

  return (
    <MainLayout title="Upload Wizard">
      <div className="max-w-3xl mx-auto space-y-6">
        {step === 1 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">1. Select File</h2>
            <input type="file" accept=".csv,.xls,.xlsx,.pdf" onChange={e => handleFile(e.target.files[0])} />
            {file && (
              <Button onClick={() => setPreviewModal(true)} variant="secondary">Preview</Button>
            )}
            {errors.length > 0 && <ul className="text-red-600 text-sm list-disc list-inside">{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>}
            {file && headers.length>0 && <Button onClick={() => setStep(2)}>Next</Button>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">2. Map Fields</h2>
            {ext !== 'pdf' ? (
              <>
                {required.map((f) => (
                  <div key={f}>
                    <label className="block text-sm font-medium mb-1">{f}</label>
                    <select
                      className="input w-full"
                      value={fieldMap[f]}
                      onChange={e => setFieldMap(prev => ({ ...prev, [f]: e.target.value }))}
                    >
                      <option value="">--</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
                <Button onClick={() => {
                  const mapped = rows.map(r => {
                    const obj = { ...r };
                    required.forEach(field => {
                      if (fieldMap[field]) obj[field] = r[fieldMap[field]];
                    });
                    return obj;
                  });
                  setRows(mapped);
                  const newHeaders = Array.from(new Set([...required, ...headers.filter(h => !required.includes(h))]));
                  setHeaders(newHeaders);
                  setStep(3);
                }}>Next</Button>
              </>
            ) : (
              <Button onClick={() => setStep(3)}>Next</Button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">3. Review Data</h2>
            <div className="overflow-x-auto">
              <table className="table-auto text-xs w-full">
                <thead>
                  <tr>{headers.map(h => <th key={h} className="border px-1 py-0.5 text-left">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri}>
                      {headers.map(h => (
                        <td key={h} className="border px-1 py-0.5">
                          <input
                            className="input text-xs w-full"
                            value={row[h]}
                            onChange={e => {
                              const val = e.target.value;
                              setRows(prev => prev.map((r,i)=> i===ri ? { ...r, [h]: val } : r));
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={() => setStep(4)}>Next</Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">4. Tag & Categorize</h2>
            {rows.map((row, ri) => (
              <div key={ri} className="border p-2 rounded mb-2">
                <div className="text-sm mb-1 font-medium">Row {ri + 1}</div>
                <TagEditor
                  tags={row.tags || []}
                  onAddTag={t => setRows(prev => prev.map((r,i)=> i===ri ? { ...r, tags: [...(r.tags||[]), t] } : r))}
                  onRemoveTag={t => setRows(prev => prev.map((r,i)=> i===ri ? { ...r, tags: (r.tags||[]).filter(x=>x!==t) } : r))}
                />
                <SuggestionChips suggestions={tagSuggestions[ri] || []} onClick={tag => setRows(prev => prev.map((r,i)=> i===ri ? { ...r, tags: [...(r.tags||[]), tag] } : r))} />
              </div>
            ))}
            <Button onClick={() => setStep(5)}>Next</Button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold">5. Finalize Upload</h2>
            <p className="text-sm">{rows.length} invoices, total ${totalAmount.toFixed(2)}</p>
            {uploading && (
              <div className="flex flex-col items-center space-y-2">
                <CircularProgress size={24} />
                <ProgressBar value={uploadProgress} />
              </div>
            )}
            <Tooltip title="Submit invoices">
              <span>
                <Button onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
              </span>
            </Tooltip>
          </div>
        )}

        <PreviewModal
          open={previewModal}
          data={file ? { name: file.name, preview: [headers, ...rows.slice(0,5).map(r => headers.map(h => r[h]))] } : null }
          onClose={() => setPreviewModal(false)}
        />
      </div>
    </MainLayout>
  );
}
