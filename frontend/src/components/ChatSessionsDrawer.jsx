import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Clock, Share2 } from 'lucide-react';

export default function ChatSessionsDrawer({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSwitchSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onExportSession,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const startRename = (s) => {
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="absolute left-14 top-0 bottom-0 z-40 w-80 glass-panel-light-green border-r border-emerald-500/25 flex flex-col p-4 shadow-2xl animate-slideInRight">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
            Chat Threads ({sessions.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-emerald-400 rounded-lg hover:text-white hover:bg-emerald-800/40"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Session Action */}
      <div className="pt-3 pb-2">
        <button
          onClick={() => onCreateSession()}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Analysis Thread</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar py-2">
        {sessions.map((s) => {
          const isActive = s.id === currentSessionId;
          const isEditing = editingId === s.id;

          return (
            <div
              key={s.id}
              onClick={() => !isEditing && onSwitchSession(s.id)}
              className={`group p-3 rounded-xl border transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-emerald-900/60 border-emerald-400/50 shadow-md shadow-emerald-500/15 text-emerald-100'
                  : 'bg-emerald-950/40 border-emerald-500/15 hover:bg-emerald-900/30 text-emerald-200/90'
              }`}
            >
              {/* Title / Edit input */}
              {isEditing ? (
                <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename(s.id)}
                    autoFocus
                    className="flex-1 px-2 py-1 text-xs rounded bg-emerald-950 border border-emerald-400 text-emerald-100 focus:outline-none"
                  />
                  <button
                    onClick={() => saveRename(s.id)}
                    className="p-1 text-emerald-300 hover:text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-rose-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs font-bold truncate group-hover:text-emerald-300">
                      {s.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-emerald-400/75">
                      <span className="flex items-center">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {s.createdAt || 'Recent'}
                      </span>
                      <span>•</span>
                      <span>{s.messages.length} msg{s.messages.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  {/* Actions (visible on hover or active) */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {onExportSession && (
                      <button
                        onClick={() => onExportSession(s.id)}
                        title="Export this chat thread"
                        className="p-1 text-emerald-400 hover:text-emerald-100 rounded hover:bg-emerald-800/50"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => startRename(s)}
                      title="Rename thread"
                      className="p-1 text-emerald-400 hover:text-emerald-100 rounded hover:bg-emerald-800/50"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteSession(s.id)}
                      title="Delete thread"
                      className="p-1 text-rose-400 hover:text-rose-200 rounded hover:bg-rose-950/60"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
