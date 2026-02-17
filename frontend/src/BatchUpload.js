import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ImprovedMainLayout from './components/ImprovedMainLayout';
import { API_BASE } from './api';
import { ConfidenceBadge } from './components/ConfidenceIndicator';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.csv', '.eml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 50;

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️';
  if (ext === 'docx') return '📝';
  if (ext === 'csv') return '📊';
  if (ext === 'eml') return '📧';
  return '📎';
}

export default function BatchUpload() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadPhase, setUploadPhase] = useState('');
  const [processedCount, setProcessedCount] = useState(0);

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type: ${ext}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (max ${formatFileSize(MAX_FILE_SIZE)})`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.file.name + f.file.size));
      const toAdd = [];
      for (const file of fileArray) {
        const key = file.name + file.size;
        if (existing.has(key)) continue;
        const error = validateFile(file);
        toAdd.push({ file, error, status: error ? 'invalid' : 'ready' });
        existing.add(key);
      }
      const combined = [...prev, ...toAdd];
      if (combined.length > MAX_FILES) {
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setResults(null);
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'ready');
    if (validFiles.length === 0) return;

    setUploading(true);
    setResults(null);
    setProcessedCount(0);

    const BATCH_SIZE = 5;
    const allResults = [];

    for (let i = 0; i < validFiles.length; i += BATCH_SIZE) {
      const batch = validFiles.slice(i, i + BATCH_SIZE);
      setUploadPhase(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(validFiles.length / BATCH_SIZE)}...`);

      const formData = new FormData();
      batch.forEach(({ file }) => formData.append('files', file));

      try {
        const res = await fetch(`${API_BASE}/api/claims/batch-upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.results) {
          allResults.push(...data.results);
          setProcessedCount(prev => prev + data.results.length);
          setFiles(prev => prev.map(f => {
            const match = data.results.find(r => r.file_name === f.file.name);
            if (match) {
              return { ...f, status: match.status, result: match };
            }
            return f;
          }));
        } else {
          batch.forEach(({ file }) => {
            allResults.push({ file_name: file.name, status: 'error', error: data.message || 'Upload failed' });
          });
          setProcessedCount(prev => prev + batch.length);
        }
      } catch (err) {
        batch.forEach(({ file }) => {
          allResults.push({ file_name: file.name, status: 'error', error: 'Network error' });
        });
        setProcessedCount(prev => prev + batch.length);
      }
    }

    const uploaded = allResults.filter(r => r.status === 'uploaded').length;
    const duplicates = allResults.filter(r => r.status === 'duplicate').length;
    const errors = allResults.filter(r => r.status === 'error').length;
    setResults({ total: allResults.length, uploaded, duplicates, errors, items: allResults });
    setUploadPhase('');
    setUploading(false);

    if (uploaded === 1 && allResults.length === 1 && allResults[0].id) {
      navigate(`/claim/${allResults[0].id}`);
      return;
    }
  };

  const validCount = files.filter(f => f.status === 'ready').length;
  const invalidCount = files.filter(f => f.status === 'invalid').length;

  return (
    <ImprovedMainLayout title="Batch Upload">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Claim Files</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload up to {MAX_FILES} claim documents at once. AI extraction runs automatically on each file.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              No system integration required
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Export results after review
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Your data stays private
            </span>
          </div>
        </div>

        {!results && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(',')}
                className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
              />
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {dragActive ? 'Drop files here' : 'Drag & drop claim files here'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click to browse. Supports PDF, DOCX, PNG, JPG, TXT, CSV, EML
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Max {MAX_FILES} files, {formatFileSize(MAX_FILE_SIZE)} each
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Typical processing time: ~20–40 seconds
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                    {invalidCount > 0 && (
                      <span className="text-sm font-normal text-red-500 ml-2">
                        ({invalidCount} invalid)
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    {!uploading && (
                      <button
                        onClick={clearAll}
                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg dark:border-gray-700 divide-y dark:divide-gray-700 max-h-80 overflow-y-auto">
                  {files.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <span className="text-lg flex-shrink-0">{getFileIcon(item.file.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.status === 'ready' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Ready
                          </span>
                        )}
                        {item.status === 'invalid' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" title={item.error}>
                            {item.error}
                          </span>
                        )}
                        {item.status === 'uploaded' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Uploaded
                          </span>
                        )}
                        {item.status === 'duplicate' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Duplicate
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" title={item.result?.error}>
                            Failed
                          </span>
                        )}
                        {!uploading && item.status === 'ready' && (
                          <button
                            onClick={() => removeFile(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {uploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{uploadPhase}</span>
                      <span>{processedCount} / {validCount} processed</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${validCount > 0 ? (processedCount / validCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || validCount === 0}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Upload {validCount} File{validCount !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">{results.uploaded}</p>
                <p className="text-sm text-green-600 dark:text-green-500">Uploaded</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{results.duplicates}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">Duplicates</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-700 dark:text-red-400">{results.errors}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Errors</p>
              </div>
            </div>

            <div className="border rounded-lg dark:border-gray-700">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Processing Results</h3>
              </div>
              <div className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
                {results.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg">{getFileIcon(item.file_name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.file_name}</p>
                      {item.doc_type && (
                        <p className="text-xs text-gray-500 capitalize">{item.doc_type.replace(/_/g, ' ')}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'uploaded' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Uploaded
                        </span>
                      )}
                      {item.status === 'duplicate' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Duplicate
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" title={item.error}>
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const firstUploaded = results.items.find(r => r.status === 'uploaded' && r.id);
                  if (firstUploaded) {
                    navigate(`/claim/${firstUploaded.id}`);
                  } else {
                    navigate('/claims');
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {results.items.some(r => r.status === 'uploaded' && r.id) ? 'View Prepared Claim' : 'View All Claims'}
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Upload More
              </button>
            </div>
          </div>
        )}
      </div>
    </ImprovedMainLayout>
  );
}
