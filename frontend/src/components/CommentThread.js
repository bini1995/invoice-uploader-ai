import React, { useState, useRef } from 'react';
import useSWR from 'swr';
import { API_BASE } from '../api';

/**
 * Renders a threaded comment list for a claim with optimistic posting,
 * ETag caching, and accessible controls.
 *
 * @param {Object} props - Component props.
 * @param {string} props.claimId - Identifier of the claim to load comments for.
 * @param {string} props.token - Auth token used for API requests.
 * @returns {JSX.Element}
 */
export default function CommentThread({ claimId, token }) {
  const etag = useRef('');
  const fetcher = url =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'If-None-Match': etag.current || '',
      },
    }).then(res => {
      if (res.status === 304) return { comments: undefined };
      etag.current = res.headers.get('ETag') || '';
      return res.json();
    });
  const { data, error, isLoading, mutate } = useSWR(
    claimId && token ? `${API_BASE}/api/claims/${claimId}/comments` : null,
    fetcher
  );
  const comments = data?.comments || [];

  const [replyTo, setReplyTo] = useState(null);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const inputRef = useRef(null);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 1000 || posting) return;
    setPosting(true);
    const tempId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      parent_id: replyTo,
      depth: 0,
      text: trimmed,
      created_at: new Date().toISOString(),
    };
    const prev = comments;
    mutate([...(comments || []), optimistic], false);
    try {
      const res = await fetch(`${API_BASE}/api/claims/${claimId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        },
        body: JSON.stringify(
          replyTo ? { text: trimmed, parent_id: replyTo } : { text: trimmed }
        ),
      });
      if (!res.ok) throw new Error('post failed');
      const saved = await res.json();
      mutate([...(prev || []), saved], false);
      const replyingTo = replyTo;
      setText('');
      setReplyTo(null);
      setTimeout(() => {
        if (replyingTo) {
          document.getElementById(`comment-${saved.id}`)?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 0);
      mutate();
    } catch (err) {
      mutate(prev, false);
    } finally {
      setPosting(false);
    }
  };

  const handleKey = e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape' && replyTo) {
      setReplyTo(null);
    }
  };

  if (isLoading) return <div className="text-xs">Loading comments...</div>;
  if (error) return <div className="text-xs text-red-500">Failed to load comments</div>;

  return (
    <div>
      <div
        className="space-y-1 max-h-40 overflow-y-auto"
        role="list"
        aria-label="Comments"
      >
        {comments.length ? (
          comments.map(c => (
            <div
              key={c.id}
              id={`comment-${c.id}`}
              tabIndex={-1}
              className="mb-1"
              style={{ marginLeft: c.depth * 16 }}
              role="listitem"
            >
              <div className="text-xs bg-gray-100 p-1 rounded">{c.text}</div>
              <button
                onClick={() => setReplyTo(c.id)}
                className="text-[10px] text-blue-600"
                aria-label={`Reply to comment ${c.id}`}
                type="button"
              >
                Reply
              </button>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500">No comments yet</div>
        )}
      </div>
      <div className="mt-1">
        {replyTo && (
          <div className="text-[10px] mb-1 flex items-center">
            <span className="mr-2">Replying to #{replyTo}</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-[10px] text-blue-600 underline"
              aria-label="Cancel reply"
            >
              Cancel
            </button>
          </div>
        )}
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          className="input text-xs w-full resize-none px-1"
          rows={2}
          placeholder="Add comment"
          aria-label="Comment text"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-gray-500">{text.length}/1000</span>
          <button
            onClick={submit}
            disabled={posting || !text.trim()}
            className="bg-indigo-600 disabled:opacity-50 text-white text-xs px-2 py-1 ml-1 rounded"
            type="button"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
