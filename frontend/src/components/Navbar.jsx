import React from 'react';
import { Bot, FileText, Database } from 'lucide-react';

export default function Navbar({
  isServerOnline,
  totalDocuments,
  totalChunks,
}) {
  return (
    <header className="h-14 border-b border-emerald-500/20 bg-emerald-950/90 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-md">
      {/* Brand Header */}
      <div className="flex items-center space-x-3">
        {/* Robot Logo Mark */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 via-green-500 to-teal-300 p-0.5 shadow-md shadow-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <span className="text-base font-extrabold text-emerald-100 tracking-wide flex items-center gap-2">
            RAG Chatbot <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/35 px-2 py-0.5 rounded-full">Google Gemini</span>
          </span>
        </div>

        {/* Server Status Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/20 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isServerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className={isServerOnline ? 'text-emerald-300 font-semibold' : 'text-rose-400 font-semibold'}>
            {isServerOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Center Doc & Vector Info Badges */}
      <div className="hidden md:flex items-center space-x-3 text-xs text-emerald-200/90">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-900/40 border border-emerald-500/20">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Documents: <strong className="text-emerald-100 text-xs">{totalDocuments}</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-900/40 border border-emerald-500/20">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Vector Chunks: <strong className="text-emerald-100 text-xs">{totalChunks}</strong></span>
        </div>
      </div>
    </header>
  );
}
