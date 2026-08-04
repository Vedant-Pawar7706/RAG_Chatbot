import React from 'react';
import { FileText, Trash2, Layers, HardDrive } from 'lucide-react';

export default function DocumentCard({ doc, onDelete }) {
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtensionBadge = (filename) => {
    if (filename.endsWith('.pdf')) return 'text-rose-300 bg-rose-500/15 border-rose-500/30';
    if (filename.endsWith('.docx')) return 'text-sky-300 bg-sky-500/15 border-sky-500/30';
    return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
  };

  return (
    <div className="group relative p-3.5 rounded-xl glass-card-light-green transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className={`p-2.5 rounded-xl border ${getFileExtensionBadge(doc.filename)}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h4
              className="text-xs md:text-sm font-bold text-emerald-100 truncate group-hover:text-emerald-300 transition-colors"
              title={doc.filename}
            >
              {doc.filename}
            </h4>
            <div className="flex items-center space-x-2 mt-1 text-xs text-emerald-300/70">
              <span className="flex items-center">
                <Layers className="w-3 h-3 mr-1 text-emerald-400" />
                {doc.chunks_count} {doc.chunks_count === 1 ? 'chunk' : 'chunks'}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <HardDrive className="w-3 h-3 mr-1 text-emerald-400/60" />
                {formatBytes(doc.file_size_bytes)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(doc.filename)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-emerald-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
          title="Delete document from index"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
