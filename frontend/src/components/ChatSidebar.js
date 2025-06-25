import React, { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Spinner from './Spinner';
import SuggestionChips from './SuggestionChips';
import FeedbackButtons from './FeedbackButtons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function ChatSidebar({ open, onClose, onAsk, onChart, onBilling, onUpload, history, loading, invoice }) {
  const [question, setQuestion] = useState('');
  const [chartQ, setChartQ] = useState('');
  const [billingQ, setBillingQ] = useState('');
  const suggestions = [
    'Find duplicate invoices',
    'Summarize top vendors',
    'Show anomalies',
  ];

  const handleSuggestion = (s) => {
    onAsk(s);
  };

  const submitAsk = () => {
    if (/upload .*invoice/i.test(question)) {
      onUpload?.(question);
    } else {
      onAsk(question);
    }
    setQuestion('');
  };
  const submitChart = () => {
    onChart(chartQ);
    setChartQ('');
  };
  const submitBilling = () => {
    onBilling(billingQ);
    setBillingQ('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      className={`fixed bottom-4 right-4 w-80 h-96 max-w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg transform transition-transform z-30 ${
        open ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="p-2 border-b flex justify-between items-center">
        <h2 id="chat-title" className="text-lg font-semibold">AI Assistant</h2>
        {invoice && (
          <span className="text-xs text-gray-500 ml-2">#{invoice.invoice_number} - {invoice.vendor}</span>
        )}
        <button
          onClick={onClose}
          title="Close"
          aria-label="Close chat"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-2 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100% - 160px)' }}>
        {history.map((item, idx) => (
          <div key={idx} className="mb-4 text-sm">
            <div className="font-medium">
              {item.type === 'chart' ? 'Chart:' : 'Q:'} {item.question}
            </div>
            {item.type === 'chat' && (
              <div className="mt-1 whitespace-pre-wrap">
                {item.answer}
                <FeedbackButtons endpoint="chat" />
              </div>
            )}
            {item.type === 'chart' && item.chartData && item.chartData.length > 0 && (
              <div className="h-32 mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={item.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={Object.keys(item.chartData[0])[0]} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={Object.keys(item.chartData[0])[1]} fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
                <FeedbackButtons endpoint="chart" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-2 space-y-2 border-t">
        <SuggestionChips suggestions={suggestions} onClick={handleSuggestion} />
        {loading && (
          <div className="flex justify-center py-2">
            <Spinner className="h-4 w-4" />
          </div>
        )}
        <div className="flex space-x-1">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitAsk()}
            placeholder="Ask AI..."
            aria-label="Ask AI"
            className="input flex-1 text-sm"
            disabled={loading}
          />
          <button
            onClick={submitAsk}
            className="btn btn-primary text-sm"
            title="Ask"
            aria-label="Submit question"
            disabled={loading}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex space-x-1">
          <input
            value={chartQ}
            onChange={(e) => setChartQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitChart()}
            placeholder="Chart query..."
            aria-label="Chart query"
            className="input flex-1 text-sm"
            disabled={loading}
          />
          <button
            onClick={submitChart}
            className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
            title="Chart"
            aria-label="Submit chart query"
            disabled={loading}
          >
            Chart
          </button>
        </div>
        <div className="flex space-x-1">
          <input
            value={billingQ}
            onChange={(e) => setBillingQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitBilling()}
            placeholder="Billing question..."
            aria-label="Billing question"
            className="input flex-1 text-sm"
            disabled={loading}
          />
          <button
            onClick={submitBilling}
            className="btn bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
            title="Billing"
            aria-label="Submit billing question"
            disabled={loading}
          >
            Billing
          </button>
        </div>
      </div>
    </div>
  );
}
