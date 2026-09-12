import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  Search,
  Plus,
  X,
  Database,
  BarChart3,
} from 'lucide-react';
import DocumentCard from './DocumentCard';

export default function Sidebar({
  documents,
  totalChunks,
  onOpenUpload,
  onOpenMetrics,
  onDeleteDocument,
  onClearKnowledgeBase,
  isClearing,
  isOpen,
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="absolute left-14 top-0 bottom-0 z-40 w-84 glass-panel-light-green border-r border-emerald-500/25 flex flex-col shadow-2xl animate-slideInRight">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-950/40">
        <div className="flex items-center space-x-2.5">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
            Knowledge Base
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-800/40 transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons: Upload & View Metrics */}
      <div className="p-4 border-b border-emerald-500/15 space-y-2">
        <button
          onClick={onOpenUpload}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>

        {onOpenMetrics && (
          <button
            onClick={onOpenMetrics}
            className="w-full py-1.5 px-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/25 text-emerald-300 hover:text-emerald-100 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Document Metrics & Stats</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      {documents.length > 0 && (
        <div className="px-4 py-3 border-b border-emerald-500/15">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-500/70" />
            <input
              type="text"
              placeholder="Search indexed files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-emerald-950/60 border border-emerald-500/25 rounded-lg text-sm text-emerald-100 placeholder-emerald-500/60 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-emerald-400/60">
            <FileText className="w-12 h-12 mx-auto mb-3 text-emerald-500/40" />
            <p className="text-sm font-bold text-emerald-200">No documents indexed</p>
            <p className="text-xs text-emerald-400/70 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Upload PDF, DOCX, or TXT files to build your vector database.
            </p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-emerald-400/60 text-sm">
            No matching files found.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <DocumentCard key={doc.filename} doc={doc} onDelete={onDeleteDocument} />
          ))
        )}
      </div>

      {/* Sidebar Footer */}
      {documents.length > 0 && (
        <div className="p-4 border-t border-emerald-500/20 bg-emerald-950/50">
          <button
            onClick={onClearKnowledgeBase}
            disabled={isClearing}
            className="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>{isClearing ? 'Clearing Index...' : 'Clear Knowledge Base'}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
