import React, { useState, useEffect } from 'react';
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
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [previewModal, setPreviewModal] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const required = ['invoice_number', 'date', 'amount', 'vendor'];

  const parseCSV = async (fileObj) => {
    const text = await fileObj.text();
    const lines = text.trim().split(/\r?\n/);
    const heads = lines[0].split(',').map(h => h.trim());
    setHeaders(heads);
    const missing = required.filter(h => !heads.includes(h));
    if (missing.length) setErrors([`Missing: ${missing.join(', ')}`]);
    const parsedRows = lines.slice(1).map(l => {
      const vals = l.split(',');
      const obj = {};
      heads.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
      return obj;
    });
    setRows(parsedRows);
  };

  const handleFile = (f) => {
    setErrors([]);
    setFile(f);
    parseCSV(f);
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
    if (step === 3) {
      rows.forEach((_, idx) => handleSuggest(idx));
    }
  }, [step]);

  return (
    <MainLayout title="Upload Wizard">
      <div className="max-w-3xl mx-auto space-y-6">
        {step === 1 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">1. Select File</h2>
            <input type="file" accept=".csv" onChange={e => handleFile(e.target.files[0])} />
            {file && (
              <Button onClick={() => setPreviewModal(true)} variant="secondary">Preview</Button>
            )}
            {errors.length > 0 && <ul className="text-red-600 text-sm list-disc list-inside">{errors.map((e,i)=><li key={i}>{e}</li>)}</ul>}
            {file && <Button onClick={() => setStep(2)}>Next</Button>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">2. Review Data</h2>
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
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-lg font-semibold">3. Tag & Categorize</h2>
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
            <Button onClick={() => setStep(4)}>Next</Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold">4. Finalize Upload</h2>
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
