import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [voice, setVoice] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything about Invoice Uploader AI.' }
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }, { sender: 'bot', text: 'Thanks for your message!' }]);
    setInput('');
  };

  return (
    <>
      <button
        className="fixed bottom-4 right-4 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-30"
        onClick={() => setOpen(!open)}
        aria-label="Toggle chat"
        title="Chat with us"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col z-30">
          <div className="p-2 border-b flex justify-between items-center">
            <span className="font-semibold text-sm">Assistant</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVoice(v => !v)}
                className={`p-1 rounded ${voice ? 'bg-indigo-600 text-white' : ''}`}
                title="Toggle voice mode"
                aria-label="Toggle voice mode"
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close chat" title="Close" className="p-1 rounded hover:bg-gray-100">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-sm space-y-2" style={{ maxHeight: '200px' }}>
            {messages.map((m, i) => (
              <div key={i} className={m.sender === 'user' ? 'text-right' : ''}>{m.text}</div>
            ))}
          </div>
          <div className="p-2 border-t flex space-x-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={voice ? 'Voice mode on' : 'Type a message'}
              className="input flex-1 text-sm"
              disabled={voice}
            />
            <button onClick={send} className="btn btn-primary text-sm">Send</button>
          </div>
        </div>
      )}
    </>
  );
}
