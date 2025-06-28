import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import {
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  LightBulbIcon,
  DocumentTextIcon,
  FingerPrintIcon,
  Squares2X2Icon,
  TagIcon,
} from '@heroicons/react/24/outline';

export default function AIAssistantPanel({
  onAsk,
  onVoice,
  onFeature,
  onSummary,
  onPattern,
  onCategorize,
  onTagging,
}) {
  const [open, setOpen] = useState(false);
  const [tips, setTips] = useState(() => ({
    summary: !localStorage.getItem('tipSummary'),
    pattern: !localStorage.getItem('tipPattern'),
    categorize: !localStorage.getItem('tipCategorize'),
    tagging: !localStorage.getItem('tipTagging'),
    ask: !localStorage.getItem('tipAsk'),
    voice: !localStorage.getItem('tipVoice'),
    suggest: !localStorage.getItem('tipSuggest'),
  }));

  const hideTip = (key) => {
    if (tips[key]) {
      setTips((t) => ({ ...t, [key]: false }));
      localStorage.setItem(`tip${key.charAt(0).toUpperCase() + key.slice(1)}`, '1');
    }
  };

  const ActionButton = ({ onClick, Icon, label, tipKey }) => (
    <Tippy
      content={tips[tipKey] ? label : null}
      visible={tips[tipKey]}
      onHidden={() => hideTip(tipKey)}
      placement="left"
    >
      <button
        onClick={() => {
          hideTip(tipKey);
          onClick && onClick();
        }}
        className="p-2 rounded bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex items-center text-xs gap-1"
        aria-label={label}
        title={label}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </button>
    </Tippy>
  );

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2 z-30">
      {open && (
        <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg flex flex-col items-end space-y-2">
          <ActionButton onClick={onSummary} Icon={DocumentTextIcon} label="Summary" tipKey="summary" />
          <ActionButton onClick={onPattern} Icon={FingerPrintIcon} label="Pattern" tipKey="pattern" />
          <ActionButton onClick={onCategorize} Icon={Squares2X2Icon} label="Categorize" tipKey="categorize" />
          <ActionButton onClick={onTagging} Icon={TagIcon} label="Tag & Route" tipKey="tagging" />
          <ActionButton onClick={onAsk} Icon={ChatBubbleLeftRightIcon} label="Ask AI" tipKey="ask" />
          {onVoice && <ActionButton onClick={onVoice} Icon={MicrophoneIcon} label="Voice" tipKey="voice" />}
          {onFeature && <ActionButton onClick={onFeature} Icon={LightBulbIcon} label="Suggest" tipKey="suggest" />}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="AI Assistant"
        title="AI Assistant"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
