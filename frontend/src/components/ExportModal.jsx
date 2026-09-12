import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Code2,
  Copy,
  Check,
  Share2,
  Printer,
  AlignLeft,
  Table,
  MessageSquare,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function ExportModal({
  isOpen,
  onClose,
  exportSession,
  currentSessionTitle,
  sessions = [],
  currentSessionId,
  persona,
}) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState('markdown'); // 'markdown' | 'text' | 'json' | 'html' | 'csv'
  const [exportScope, setExportScope] = useState('current'); // 'current' | 'all'
  const [selectedSessionId, setSelectedSessionId] = useState(currentSessionId || '');

  if (!isOpen) return null;

  // Active target session ID
  const activeSessionId = exportScope === 'all' ? null : (selectedSessionId || currentSessionId);
  const content = exportSession(exportFormat, activeSessionId, exportScope);

  // Compute metrics for the exported selection
  const targetSessions =
    exportScope === 'all'
      ? sessions
      : [sessions.find((s) => s.id === activeSessionId) || sessions[0]].filter(Boolean);

  const totalMessages = targetSessions.reduce((acc, s) => acc + (s?.messages?.length || 0), 0);
  const userMessages = targetSessions.reduce(
    (acc, s) => acc + (s?.messages?.filter((m) => m.role === 'user').length || 0),
    0
  );
  const totalCitations = targetSessions.reduce(
    (acc, s) =>
      acc +
      (s?.messages?.reduce((cAcc, m) => cAcc + (m.citations?.length || 0), 0) || 0),
    0
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensionMap = {
      markdown: 'md',
      text: 'txt',
      json: 'json',
      html: 'html',
      csv: 'csv',
    };
    const mimeMap = {
      markdown: 'text/markdown',
      text: 'text/plain',
      json: 'application/json',
      html: 'text/html',
      csv: 'text/csv',
    };

    const extension = extensionMap[exportFormat] || 'md';
    const mimeType = mimeMap[exportFormat] || 'text/plain';

    const safeTitle =
      exportScope === 'all'
        ? 'All_Chat_Threads'
        : (currentSessionTitle || 'analysis').replace(/[^a-zA-Z0-9_-]/g, '_');

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocMind_Chat_${safeTitle}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    // Generate HTML content for printing
    const htmlContent = exportSession('html', activeSessionId, exportScope);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[88vh] overflow-hidden border rounded-3xl glass-panel-light-green border-emerald-500/30 shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-500/20 bg-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md text-white">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
                Export Chat Conversation
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  {exportScope === 'all' ? 'All Sessions' : 'Active Thread'}
                </span>
              </h2>
              <p className="text-xs text-emerald-300/80">
                Download or share your AI-grounded dialogue and citations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope & Chat Stats Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-emerald-500/15 bg-emerald-950/60 text-xs">
          {/* Scope Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-emerald-300/80 font-medium text-[11px]">Scope:</span>
            <div className="inline-flex rounded-xl p-0.5 bg-emerald-900/50 border border-emerald-500/25">
              <button
                onClick={() => setExportScope('current')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  exportScope === 'current'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-emerald-300/80 hover:text-emerald-100'
                }`}
              >
                Active Thread
              </button>
              {sessions.length > 1 && (
                <button
                  onClick={() => setExportScope('all')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                    exportScope === 'all'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-300/80 hover:text-emerald-100'
                  }`}
                >
                  All Threads ({sessions.length})
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center space-x-3 text-[11px] text-emerald-300/85">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{totalMessages} msgs</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{userMessages} prompts</span>
            </div>
            {totalCitations > 0 && (
              <>
                <span>&bull;</span>
                <div className="flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{totalCitations} citations</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Format Selector & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-emerald-500/20 bg-emerald-950/40">
          {/* Format pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setExportFormat('markdown')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                exportFormat === 'markdown'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown (.md)</span>
            </button>

            <button
              onClick={() => setExportFormat('text')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                exportFormat === 'text'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Text (.txt)</span>
            </button>

            <button
              onClick={() => setExportFormat('json')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                exportFormat === 'json'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>JSON (.json)</span>
            </button>

            <button
              onClick={() => setExportFormat('html')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                exportFormat === 'html'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>HTML / PDF</span>
            </button>

            <button
              onClick={() => setExportFormat('csv')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                exportFormat === 'csv'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>CSV (.csv)</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/70 border border-emerald-500/30 text-emerald-200 text-xs font-bold transition-all active:scale-95"
              title="Copy export content to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-900/60 hover:bg-teal-800/70 border border-teal-500/30 text-teal-200 text-xs font-bold transition-all active:scale-95"
              title="Print conversation or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all active:scale-95"
              title="Download file to your device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Live Export Preview */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-emerald-950/30">
          <div className="mb-2 flex items-center justify-between text-[11px] text-emerald-400/80">
            <span>Live Output Preview ({exportFormat.toUpperCase()})</span>
            <span>{content.length.toLocaleString()} characters</span>
          </div>
          <pre className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/20 text-emerald-200 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[46vh] overflow-y-auto custom-scrollbar">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
