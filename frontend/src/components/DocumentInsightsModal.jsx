import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  FileText,
  Sparkles,
  BarChart3,
  Clock,
  Database,
  Layers,
  RefreshCw,
  AlertCircle,
  HardDrive,
  PieChart,
  Search,
  Upload,
} from 'lucide-react';
import { getDocumentStats, getDocumentSummary } from '../services/api';

export default function DocumentInsightsModal({
  isOpen,
  onClose,
  initialTab = 'stats', // 'stats' | 'summary'
  onOpenUpload,
}) {
  const [stats, setStats] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'stats');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch quantitative document stats
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const statsRes = await getDocumentStats();
      if (statsRes && statsRes.error) {
        setStatsError(statsRes.error);
      } else {
        setStats(statsRes);
      }
    } catch (err) {
      console.warn('Error fetching stats:', err);
      setStatsError(err.message || 'Failed to retrieve document metrics');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Fetch executive summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
      const summaryRes = await getDocumentSummary();
      setSummaryData(summaryRes);
    } catch (err) {
      console.warn('Error fetching summary:', err);
      setSummaryError(err.message || 'Failed to generate executive briefing');
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // Reload all insights
  const handleRefreshAll = () => {
    fetchStats();
    fetchSummary();
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'stats');
      fetchStats();
      fetchSummary();
    }
  }, [isOpen, initialTab, fetchStats, fetchSummary]);

  if (!isOpen) return null;

  // Filtered files for search
  const filteredFiles = (stats?.files || []).filter((f) =>
    f.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileTypeBadge = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'bg-rose-500/20 border-rose-500/40 text-rose-300';
      case 'docx':
        return 'bg-sky-500/20 border-sky-500/40 text-sky-300';
      default:
        return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden border rounded-3xl glass-panel-light-green border-emerald-500/30 shadow-2xl flex flex-col">
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-500/20 bg-emerald-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md text-white">
              {activeTab === 'stats' ? (
                <BarChart3 className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-emerald-100 flex items-center gap-2">
                Document Metrics & Intelligence
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  FAISS &bull; Gemini
                </span>
              </h2>
              <p className="text-xs text-emerald-300/80">
                Quantitative metrics, chunk breakdown, and automated intelligence briefing
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefreshAll}
              disabled={isLoadingSummary || isLoadingStats}
              title="Refresh Metrics & Insights"
              className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800/40 transition-colors disabled:opacity-50 flex items-center space-x-1 text-xs"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingStats || isLoadingSummary ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-800/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-emerald-500/20 px-5 pt-2 bg-emerald-950/50">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'stats'
                ? 'border-emerald-400 text-emerald-100 shadow-sm'
                : 'border-transparent text-emerald-400/70 hover:text-emerald-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Document Metrics</span>
            {stats && stats.total_documents > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] text-emerald-300 font-mono">
                {stats.total_documents}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all ${
              activeTab === 'summary'
                ? 'border-emerald-400 text-emerald-100 shadow-sm'
                : 'border-transparent text-emerald-400/70 hover:text-emerald-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Executive Briefing</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
          {/* Top High-Level KPI Cards */}
          {isLoadingStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 h-20 flex flex-col justify-between"
                >
                  <div className="w-12 h-3 bg-emerald-800/40 rounded" />
                  <div className="w-16 h-6 bg-emerald-700/40 rounded" />
                </div>
              ))}
            </div>
          ) : statsError ? (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{statsError}</span>
              </div>
              <button
                onClick={fetchStats}
                className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 text-rose-100 font-semibold"
              >
                Retry
              </button>
            </div>
          ) : (
            stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {/* Total Documents */}
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Total Files</span>
                  </div>
                  <p className="text-xl font-extrabold text-emerald-100">
                    {stats.total_documents || 0}
                  </p>
                </div>

                {/* Total Chunks/Vectors */}
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-teal-400 text-xs mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Vectors</span>
                  </div>
                  <p className="text-xl font-extrabold text-emerald-100">
                    {(stats.total_chunks || 0).toLocaleString()}
                  </p>
                </div>

                {/* Total Estimated Words */}
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Est. Words</span>
                  </div>
                  <p className="text-xl font-extrabold text-emerald-100">
                    {(stats.total_words || 0).toLocaleString()}
                  </p>
                </div>

                {/* Total Reading Time */}
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-teal-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reading Time</span>
                  </div>
                  <p className="text-xl font-extrabold text-emerald-100">
                    {stats.total_reading_time_min || 0}m
                  </p>
                </div>

                {/* Avg Chunk Chars */}
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs mb-1">
                    <PieChart className="w-3.5 h-3.5" />
                    <span>Avg Chunk</span>
                  </div>
                  <p className="text-xl font-extrabold text-emerald-100">
                    {stats.average_chunk_chars || 0} <span className="text-[10px] text-emerald-400/70 font-normal">chars</span>
                  </p>
                </div>

                {/* Storage Size */}
                <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-teal-400 text-xs mb-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Total Size</span>
                  </div>
                  <p className="text-xl font-extrabold text-emerald-100">
                    {stats.total_size_mb > 0
                      ? `${stats.total_size_mb} MB`
                      : `${stats.total_size_kb || 0} KB`}
                  </p>
                </div>
              </div>
            )
          )}

          {/* ================= TAB 1: DOCUMENT METRICS ================= */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Visual Knowledge Base Distribution Bar */}
              {stats && stats.files && stats.files.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-emerald-400" /> Vector Index Distribution
                    </span>
                    <span className="text-emerald-300/70 font-mono text-[11px]">
                      {stats.total_chunks} Total Embeddings
                    </span>
                  </div>

                  {/* Multi-colored segmented progress bar */}
                  <div className="w-full h-3 bg-emerald-950 rounded-full overflow-hidden flex border border-emerald-500/30 shadow-inner">
                    {stats.files.map((file, idx) => {
                      const colors = [
                        'bg-emerald-400',
                        'bg-teal-400',
                        'bg-cyan-400',
                        'bg-emerald-600',
                        'bg-teal-600',
                        'bg-green-500',
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div
                          key={idx}
                          style={{ width: `${Math.max(1, file.percent_of_total || 0)}%` }}
                          className={`${color} h-full transition-all`}
                          title={`${file.filename}: ${file.chunks} chunks (${file.percent_of_total}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-emerald-300/80">
                    {stats.files.slice(0, 5).map((file, idx) => {
                      const dotColors = [
                        'bg-emerald-400',
                        'bg-teal-400',
                        'bg-cyan-400',
                        'bg-emerald-600',
                        'bg-teal-600',
                        'bg-green-500',
                      ];
                      return (
                        <div key={idx} className="flex items-center space-x-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`}
                          />
                          <span className="truncate max-w-[140px] text-emerald-200">
                            {file.filename}
                          </span>
                          <span className="text-emerald-400/70 font-mono">
                            {file.percent_of_total}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Indexed Files Table Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Indexed Files Breakdown ({stats?.files?.length || 0})
                </h4>

                {stats?.files?.length > 3 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500/70" />
                    <input
                      type="text"
                      placeholder="Filter indexed files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-emerald-950/70 border border-emerald-500/25 rounded-xl text-xs text-emerald-100 placeholder-emerald-500/60 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                )}
              </div>

              {/* File Breakdown List */}
              {isLoadingStats ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/20 h-16 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-emerald-400/40 transition-colors shadow-sm"
                    >
                      {/* Left: Icon & File Info */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase flex-shrink-0 ${getFileTypeBadge(
                            file.file_type
                          )}`}
                        >
                          {file.file_type || 'DOC'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-bold text-emerald-100 truncate text-sm"
                            title={file.filename}
                          >
                            {file.filename}
                          </p>
                          <div className="flex items-center space-x-2 text-[11px] text-emerald-400/80 mt-0.5">
                            <span>{file.file_size_kb} KB</span>
                            <span>&bull;</span>
                            <span>{file.percent_of_total}% of knowledge base</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Metric Stats Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs flex-shrink-0">
                        <div className="px-2.5 py-1 rounded-xl bg-emerald-900/40 border border-emerald-500/20 text-emerald-200">
                          <span className="text-emerald-400 font-bold">{file.chunks}</span>{' '}
                          <span className="text-[11px] text-emerald-400/70">chunks</span>
                        </div>

                        <div className="px-2.5 py-1 rounded-xl bg-emerald-900/40 border border-emerald-500/20 text-emerald-200">
                          <span className="text-emerald-400 font-bold">
                            {file.estimated_words.toLocaleString()}
                          </span>{' '}
                          <span className="text-[11px] text-emerald-400/70">words</span>
                        </div>

                        <div className="px-2.5 py-1 rounded-xl bg-teal-900/40 border border-teal-500/20 text-teal-200">
                          <span className="text-teal-300 font-bold">~{file.reading_time_min}m</span>{' '}
                          <span className="text-[11px] text-teal-400/70">read</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20">
                  <FileText className="w-10 h-10 mx-auto text-emerald-500/40" />
                  <p className="text-sm font-bold text-emerald-100">No Documents Indexed</p>
                  <p className="text-xs text-emerald-300/70 max-w-sm mx-auto">
                    Upload your PDF, DOCX, or TXT documents to generate quantitative vector metrics
                    and grounded analytics.
                  </p>
                  {onOpenUpload && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenUpload();
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all inline-flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: EXECUTIVE BRIEFING ================= */}
          {activeTab === 'summary' && (
            <div>
              {isLoadingSummary ? (
                <div className="p-14 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
                  <p className="text-sm font-bold text-emerald-100">
                    Generating Executive Briefing...
                  </p>
                  <p className="text-xs text-emerald-300/70">
                    Synthesizing representative document excerpts with Google Gemini
                  </p>
                </div>
              ) : summaryError ? (
                <div className="p-8 text-center space-y-3 rounded-2xl bg-rose-950/40 border border-rose-500/20">
                  <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
                  <p className="text-sm font-bold text-rose-200">Failed to Generate Briefing</p>
                  <p className="text-xs text-rose-300/70">{summaryError}</p>
                  <button
                    onClick={fetchSummary}
                    className="px-4 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800/80 text-rose-100 text-xs font-bold"
                  >
                    Retry Briefing
                  </button>
                </div>
              ) : summaryData && summaryData.has_documents ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-300/80 px-1">
                    <span>
                      Synthesized across {summaryData.document_count} document(s)
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      Model: Gemini 2.5 / 1.5 Flash
                    </span>
                  </div>
                  <div className="p-6 rounded-2xl glass-card-light-green border border-emerald-500/25 prose prose-invert prose-emerald max-w-none text-xs leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summaryData.summary}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center space-y-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20">
                  <AlertCircle className="w-8 h-8 mx-auto text-emerald-400/60" />
                  <p className="text-sm font-bold text-emerald-100">No Documents Uploaded</p>
                  <p className="text-xs text-emerald-300/70 max-w-sm mx-auto">
                    Upload your PDF, DOCX, or TXT documents to generate an executive intelligence
                    briefing.
                  </p>
                  {onOpenUpload && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenUpload();
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all inline-flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

