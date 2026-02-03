import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function TryDocumentDemo() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');

  const simulateExtraction = useCallback((file) => {
    setFileName(file.name);
    setIsProcessing(true);
    setResult(null);

    const processingTime = 800 + Math.random() * 400;

    setTimeout(() => {
      const mockResults = {
        docType: file.name.toLowerCase().includes('invoice') ? 'Medical Invoice' : 
                 file.name.toLowerCase().includes('claim') ? 'Insurance Claim' : 
                 'Medical Document',
        readinessScore: 87 + Math.floor(Math.random() * 12),
        processingTime: Math.round(processingTime),
        fields: [
          { label: 'Policy Number', value: `POL-${Date.now().toString().slice(-8)}`, confidence: 98 },
          { label: 'Claim Amount', value: `$${(Math.random() * 50000 + 1000).toFixed(2)}`, confidence: 96 },
          { label: 'CPT Codes', value: '99213, 99214, 99215', confidence: 94 },
          { label: 'ICD-10 Codes', value: 'M54.5, S39.012A', confidence: 92 },
          { label: 'Date of Service', value: new Date().toLocaleDateString(), confidence: 99 },
          { label: 'Provider NPI', value: '1234567890', confidence: 97 }
        ]
      };
      setResult(mockResults);
      setIsProcessing(false);
    }, processingTime);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateExtraction(files[0]);
    }
  }, [simulateExtraction]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateExtraction(files[0]);
    }
  }, [simulateExtraction]);

  const resetDemo = () => {
    setResult(null);
    setFileName('');
    setIsProcessing(false);
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-6">
            <SparklesIcon className="h-4 w-4 mr-2" />
            Interactive Demo - No Signup Required
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Try It With Your Document
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Upload any claim document and watch our AI extract fields instantly. 
            Your data stays private and is never stored.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-400 bg-blue-500/10' 
                  : 'border-white/20 bg-white/5'
              } ${isProcessing ? 'pointer-events-none' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <label className="block p-12 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                />
                <div className="text-center">
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowPathIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    </motion.div>
                  ) : (
                    <CloudArrowUpIcon className={`h-16 w-16 mx-auto mb-4 ${isDragging ? 'text-blue-400' : 'text-white/50'}`} />
                  )}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isProcessing ? 'Extracting Fields...' : 'Drop your document here'}
                  </h3>
                  <p className="text-white/60 mb-4">
                    {isProcessing ? `Processing ${fileName}` : 'or click to browse'}
                  </p>
                  {!isProcessing && (
                    <p className="text-sm text-white/40">
                      Supports PDF, PNG, JPG, DOCX, TXT
                    </p>
                  )}
                </div>
              </label>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {['Sample Invoice', 'Medical Claim', 'FNOL Form'].map((sample, i) => (
                <button
                  key={sample}
                  onClick={() => simulateExtraction(new File([''], `${sample.toLowerCase().replace(' ', '-')}.pdf`))}
                  disabled={isProcessing}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                >
                  <DocumentTextIcon className="h-5 w-5 mx-auto mb-1" />
                  {sample}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 overflow-hidden"
              >
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider">Extracted From</p>
                      <h3 className="text-lg font-semibold text-white">{fileName}</h3>
                    </div>
                    <button onClick={resetDemo} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <XMarkIcon className="h-5 w-5 text-white/50" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30">
                      {result.docType}
                    </span>
                    <span className="text-white/50 text-sm">
                      Processed in {result.processingTime}ms
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Claim Readiness Score</span>
                      <span className="text-emerald-400 font-bold text-xl">{result.readinessScore}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.readinessScore}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full"
                      />
                    </div>
                  </div>

                  <h4 className="text-white/50 text-xs uppercase tracking-wider mb-3">Extracted Fields</h4>
                  <div className="space-y-3">
                    {result.fields.map((field, i) => (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div>
                          <p className="text-white/50 text-xs">{field.label}</p>
                          <p className="text-white font-medium">{field.value}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-sm">{field.confidence}%</span>
                          <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-t border-white/10">
                  <p className="text-white/80 text-sm mb-3">
                    Like what you see? Get started with full extraction capabilities.
                  </p>
                  <a
                    href="https://calendly.com/taddessebi95"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90 transition-colors"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    Start Free Trial
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center"
              >
                <DocumentTextIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/50 mb-2">
                  Extraction Results
                </h3>
                <p className="text-white/30">
                  Upload a document to see AI-powered field extraction in action
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
