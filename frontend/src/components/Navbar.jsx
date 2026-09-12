import React from 'react';
import { Bot, FileText, Database, Sparkles, Share2, BarChart3 } from 'lucide-react';
import PersonaSelector from './PersonaSelector';
import UserProfileMenu from './UserProfileMenu';
import ThemeSelector from './ThemeSelector';

export default function Navbar({
  isServerOnline,
  totalDocuments,
  totalChunks,
  currentPersona,
  onSelectPersona,
  onOpenInsights,
  onOpenMetrics,
  onOpenExport,
  auth,
  onOpenAuth,
}) {
  return (
    <header className="h-14 border-b border-emerald-500/20 bg-emerald-950/90 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-md">
      {/* Brand & Status */}
      <div className="flex items-center space-x-3">
        {/* Robot Logo Mark */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 via-green-500 to-teal-300 p-0.5 shadow-md shadow-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <span className="text-base font-extrabold text-emerald-100 tracking-wide flex items-center gap-2">
            DocMind AI <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/35 px-2 py-0.5 rounded-full hidden sm:inline-block">Google Gemini</span>
          </span>
        </div>

        {/* Server Status Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/20 text-xs">
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

      {/* Center Persona Selector */}
      <div className="hidden md:flex items-center">
        <PersonaSelector
          currentPersona={currentPersona}
          onSelectPersona={onSelectPersona}
        />
      </div>

      {/* Right Area: Metrics, Insights, Export, Stats & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Document Metrics Button */}
        <button
          onClick={onOpenMetrics}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-500/25 text-emerald-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
          title="Document Metrics & Analytics"
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Metrics</span>
        </button>

        {/* Insights Button */}
        <button
          onClick={onOpenInsights}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-500/25 text-emerald-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
          title="Executive Intelligence & Briefing"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden sm:inline">Insights</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-500/25 text-emerald-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
          title="Export Chat Dialogue"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Theme Selector */}
        <ThemeSelector />

        {/* Documents & Chunks Clickable Indicator */}
        <button
          onClick={onOpenMetrics}
          className="hidden xl:flex items-center space-x-2 text-xs text-emerald-300/80 hover:text-emerald-100 transition-colors cursor-pointer"
          title="Click to view Document Metrics"
        >
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-500/15">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>{totalDocuments}</span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-500/15">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>{totalChunks}</span>
          </div>
        </button>

        {/* User Profile Menu */}
        <UserProfileMenu auth={auth} onOpenAuth={onOpenAuth} />
      </div>
    </header>
  );
}
