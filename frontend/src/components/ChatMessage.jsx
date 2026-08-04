import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Bookmark,
} from 'lucide-react';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const isUser = message.role === 'user';
  const citations = message.citations || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex space-x-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Robot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
          <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}

      <div className={`${isUser ? 'max-w-[92%] sm:max-w-[85%]' : 'max-w-[94%] sm:max-w-[88%]'} space-y-1.5`}>
        {/* Main Message Bubble */}
        <div
          className={`relative px-4 pt-2.5 ${!isUser ? 'pb-7' : 'pb-2.5'} rounded-2xl text-sm leading-snug backdrop-blur-md shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 text-white rounded-tr-none shadow-emerald-600/20 font-medium'
              : 'glass-panel-light-green text-emerald-50 rounded-tl-none border border-emerald-500/25'
          }`}
        >
          {/* Header Metadata - Clean Top Bar with Timestamp */}
          <div className="flex items-center justify-between mb-1.5 text-[11px] opacity-75 border-b border-emerald-500/10 pb-1">
            <span className="font-bold flex items-center gap-1">
              {isUser ? 'You' : 'RAG Chatbot'}
            </span>
            <span className="font-mono text-emerald-300/80">{message.timestamp}</span>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-invert prose-emerald max-w-none break-words text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>

          {/* Copy Button Moved to Bottom Right (No Overlap with Top Timestamp) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute bottom-2 right-2.5 px-2 py-1 rounded-lg bg-emerald-900/75 hover:bg-emerald-800 border border-emerald-500/30 text-emerald-300 hover:text-emerald-100 transition-colors flex items-center gap-1 text-[11px] font-medium shadow-sm"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Citations & Sources Accordion */}
        {!isUser && citations.length > 0 && (
          <div className="mt-1.5 rounded-xl glass-card-light-green border border-emerald-500/20 overflow-hidden">
            <button
              onClick={() => setShowSources(!showSources)}
              className="w-full px-3.5 py-1.5 flex items-center justify-between text-xs font-bold text-emerald-200 hover:bg-emerald-900/40 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Retrieved Sources ({citations.length}{' '}
                  {citations.length === 1 ? 'citation' : 'citations'})
                </span>
              </div>
              {showSources ? (
                <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {showSources && (
              <div className="p-2.5 border-t border-emerald-500/20 space-y-2 bg-emerald-950/60">
                {citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-300 flex items-center">
                        <FileText className="w-3 h-3 mr-1 text-emerald-400" />
                        {cite.source} {cite.page ? `(Page ${cite.page})` : ''}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Match: {(cite.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200/90 italic bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/15 leading-relaxed">
                      "{cite.text}..."
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-300 mt-0.5 shadow-md">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
