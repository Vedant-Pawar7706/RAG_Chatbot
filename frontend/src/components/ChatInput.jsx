import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp } from 'lucide-react';

export default function ChatInput({ onSendMessage, onOpenUpload, isLoading, isServerOnline }) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim() || isLoading || !isServerOnline) return;
    onSendMessage(query);
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-1 z-20">
      <form onSubmit={handleSubmit} className="relative">
        {/* Copilot Pill Input Box (Proportioned to website layout) */}
        <div className="copilot-pill-input px-5 py-3.5 flex flex-col justify-between min-h-[84px] text-slate-800 shadow-2xl">
          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isServerOnline
                ? 'Ask anything or search your documents...'
                : 'Backend server is offline. Please start FastAPI backend.'
            }
            disabled={!isServerOnline || isLoading}
            className="w-full bg-transparent text-base font-medium text-slate-900 placeholder-slate-400/90 focus:outline-none resize-none max-h-36 custom-scrollbar disabled:opacity-60"
          />

          {/* Action Bar inside Pill Box */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 mt-1.5">
            {/* Plus Attachment Button */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="w-8 h-8 rounded-full border border-slate-300/80 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Add attachment / Upload document"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* Right Submit Button */}
            <button
              type="submit"
              disabled={!query.trim() || isLoading || !isServerOnline}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white disabled:text-slate-400 shadow-md transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
              title="Send Message"
            >
              <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
