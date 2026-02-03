import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { API_BASE } from '../api';

const KNOWLEDGE_BASE = {
  general: [
    { q: 'what is clarifyops', a: 'ClarifyOps is an AI-powered claims data extraction platform built specifically for insurance operations. We help TPAs, carriers, and brokers automate document processing, validate CPT/ICD codes, and route claims intelligently.' },
    { q: 'how does it work', a: 'Upload any claim document (PDF, image, Word) and our AI extracts key fields like policy numbers, claim amounts, CPT/ICD codes, dates, and patient info. Documents are validated, scored for completeness, and routed to the right workflow automatically.' },
    { q: 'pricing', a: 'We offer flexible pricing: Free tier (50 claims/month), Pro ($299/month for 500 claims), and Enterprise (volume-based pricing). Contact us for a custom quote at clarifyops.com.' },
    { q: 'hipaa compliant', a: 'Yes! ClarifyOps is fully HIPAA compliant with 256-bit encryption, audit logging, PHI redaction, and we sign Business Associate Agreements (BAAs) with all customers.' },
    { q: 'integrations', a: 'We integrate with Guidewire ClaimCenter, Duck Creek, Salesforce, ServiceNow, and offer REST APIs and Zapier webhooks for custom integrations.' },
    { q: 'support', a: 'We offer email support for all tiers, priority support for Pro users, and dedicated account managers for Enterprise customers. You can also schedule a demo at calendly.com/clarifyops-demo.' },
  ],
  features: [
    { q: 'claim readiness score', a: 'Our unique Claim Readiness Score (0-100%) tells you exactly how complete and accurate each claim is before submission, reducing rejections and rework.' },
    { q: 'cpt icd validation', a: 'We validate CPT and ICD-10 codes against the latest CMS databases to catch billing errors before they cause claim denials.' },
    { q: 'fraud detection', a: 'AuditFlow, our fraud detection module, uses AI to flag suspicious patterns, duplicate claims, and anomalies for human review.' },
    { q: 'workflow automation', a: 'OpsClaim automatically routes claims to the right team based on claim type, amount, complexity, and your custom rules.' },
  ],
};

function findAnswer(message) {
  const lower = message.toLowerCase();
  const allItems = [...KNOWLEDGE_BASE.general, ...KNOWLEDGE_BASE.features];
  
  for (const item of allItems) {
    if (lower.includes(item.q.split(' ')[0]) || item.q.split(' ').some(word => lower.includes(word) && word.length > 3)) {
      return item.a;
    }
  }
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm the ClarifyOps assistant. I can help you with questions about our platform, features, pricing, and more. What would you like to know?";
  }
  
  if (lower.includes('demo') || lower.includes('trial') || lower.includes('start')) {
    return "Great! You can start a free trial or schedule a demo at calendly.com/clarifyops-demo. Our team will walk you through the platform and help you get set up.";
  }
  
  return null;
}

export default function AISupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi! I'm your ClarifyOps assistant. How can I help you today? Ask me about features, pricing, integrations, or anything else!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const localAnswer = findAnswer(input.trim());
    
    if (localAnswer) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            role: 'assistant',
            content: localAnswer,
          },
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/chat/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            role: 'assistant',
            content: data.reply || "I'm here to help! Could you please rephrase your question?",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            role: 'assistant',
            content: "I can help with questions about ClarifyOps features, pricing, integrations, and more. What would you like to know?",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again or contact support@clarifyops.com for assistance.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">ClarifyOps Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center z-50 transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </motion.button>
    </>
  );
}
