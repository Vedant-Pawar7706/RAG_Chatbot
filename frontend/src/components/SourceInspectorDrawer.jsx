import React from 'react';
import { X, FileText, Sparkles, Bookmark, ArrowRight, Layers, Copy, Check } from 'lucide-react';

export default function SourceInspectorDrawer({
  citation,
  isOpen,
  onClose,
  onDeepDive,
}) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const matchPercent = Math.round((citation.score || 0) * 100);

  return (
    <aside className="fixed right-0 top-14 bottom-0 z-50 w-full sm:w-96 glass-panel-light-green border-l border-emerald-500/25 flex flex-col shadow-2xl animate-slideInLeft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-500/20 bg-emerald-950/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md text-white">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
              Source Chunk Inspector
            </h3>
            <p className="text-[11px] text-emerald-300/70 truncate max-w-[200px]">
              {citation.source}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Document Metadata Card */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/20 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-300 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Document
            </span>
            <span className="font-mono text-emerald-100 font-bold truncate max-w-[170px]">
              {citation.source}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-300">Page Number</span>
            <span className="font-bold text-emerald-100">{citation.page || 'N/A'}</span>
          </div>

          {/* Relevance bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-emerald-300/80 font-medium">Relevance Match</span>
              <strong className="text-emerald-300 font-mono">{matchPercent}%</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-950 border border-emerald-500/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.min(matchPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chunk Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Exact Chunk Excerpt
            </span>
            <button
              onClick={handleCopy}
              className="px-2 py-0.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1 border border-emerald-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/25 text-xs text-emerald-100 leading-relaxed font-sans select-text">
            {citation.text}
          </div>
        </div>

        {/* Deep Dive Action */}
        <div className="pt-2">
          <button
            onClick={() => {
              onDeepDive(`Can you summarize and analyze the details specifically from ${citation.source} (Page ${citation.page || 1}) regarding: "${citation.text?.slice(0, 100)}..."?`);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Deep Dive into This Section</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}
