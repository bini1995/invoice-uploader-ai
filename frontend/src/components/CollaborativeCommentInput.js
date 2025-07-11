import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import getCaretCoordinates from 'textarea-caret';

const COLORS = ['#e53935', '#8e24aa', '#3949ab', '#00897b', '#f4511e'];

export default function CollaborativeCommentInput({ invoiceId, onSubmit, onChange }) {
  const textareaRef = useRef(null);
  const providerRef = useRef(null);
  const ytextRef = useRef(null);
  const colorRef = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [value, setValue] = useState('');
  const [cursors, setCursors] = useState([]);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const origin = window.location.origin.replace(/^http/, 'ws');
    const provider = new WebsocketProvider(`${origin}/yjs`, `invoice-comment-${invoiceId}`, ydoc);
    providerRef.current = provider;
    const ytext = ydoc.getText('text');
    ytextRef.current = ytext;
    const awareness = provider.awareness;
    awareness.setLocalStateField('cursor', { index: 0, color: colorRef.current });
    const updateValue = () => {
      const val = ytext.toString();
      setValue(val);
      onChange && onChange(val);
    };
    ytext.observe(updateValue);
    const handleAwareness = () => {
      const states = [];
      awareness.getStates().forEach((s, id) => {
        if (id !== awareness.clientID && s.cursor) {
          states.push(s.cursor);
        }
      });
      setCursors(states);
    };
    awareness.on('change', handleAwareness);
    updateValue();
    return () => {
      awareness.off('change', handleAwareness);
      ytext.unobserve(updateValue);
      provider.destroy();
      ydoc.destroy();
    };
  }, [invoiceId, onChange]);

  const updateCursor = () => {
    const ta = textareaRef.current;
    if (ta && providerRef.current) {
      providerRef.current.awareness.setLocalStateField('cursor', {
        index: ta.selectionStart,
        color: colorRef.current,
      });
    }
  };

  const handleChange = (e) => {
    const ta = e.target.value;
    const ytext = ytextRef.current;
    if (ytext) {
      ytext.delete(0, ytext.length);
      ytext.insert(0, ta);
    }
    onChange && onChange(ta);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value);
        const ytext = ytextRef.current;
        if (ytext) {
          ytext.delete(0, ytext.length);
        }
        onChange && onChange('');
      }
    }
  };

  const cursorElems = cursors.map((c, i) => {
    if (!textareaRef.current) return null;
    const coords = getCaretCoordinates(textareaRef.current, c.index);
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: coords.left,
          top: coords.top,
          borderLeft: `2px solid ${c.color}`,
          height: '1em',
        }}
      />
    );
  });

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        className="input text-xs flex-1 px-1 w-full pr-2"
        placeholder="Add comment"
        value={value}
        rows={2}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={updateCursor}
        onClick={updateCursor}
      />
      {cursorElems}
    </div>
  );
}
