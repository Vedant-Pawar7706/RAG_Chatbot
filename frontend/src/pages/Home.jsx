import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import UploadModal from '../components/UploadModal';
import AuthModal from '../components/AuthModal';
import ChatSessionsDrawer from '../components/ChatSessionsDrawer';
import DocumentInsightsModal from '../components/DocumentInsightsModal';
import ExportModal from '../components/ExportModal';
import SourceInspectorDrawer from '../components/SourceInspectorDrawer';
import PersonaSelector from '../components/PersonaSelector';
import {
  AlertCircle,
  CheckCircle2,
  X,
  BookOpen,
  SquarePen,
  MessageSquare,
  Settings,
  Sparkles,
  Database,
  Trash2,
  Key,
  Share2,
  BarChart3,
} from 'lucide-react';

export default function Home() {
  const auth = useAuth();
  const { theme } = useTheme();

  const {
    messages,
    sessions,
    currentSessionId,
    currentSession,
    persona,
    setPersona,
    documents,
    totalChunks,
    isLoading,
    isUploading,
    isClearing,
    isServerOnline,
    error,
    successMessage,
    clearNotifications,
    sendMessage,
    uploadFile,
    deleteDocument,
    clearKnowledgeBase,
    clearChatHistory,
    refreshData,
    createNewSession,
    switchSession,
    deleteSession,
    renameSession,
    exportSession,
  } = useChat();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [insightsInitialTab, setInsightsInitialTab] = useState('stats'); // 'stats' | 'summary'
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'kb', 'history', 'settings', null
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenMetrics = () => {
    setInsightsInitialTab('stats');
    setIsInsightsOpen(true);
  };

  const handleOpenInsights = () => {
    setInsightsInitialTab('summary');
    setIsInsightsOpen(true);
  };

  // Source Citation Inspector state
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const toggleTab = (tabName) => {
    if (activeTab === tabName) {
      setActiveTab(null);
      setIsSidebarOpen(false);
    } else {
      setActiveTab(tabName);
      setIsSidebarOpen(true);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setActiveTab(null);
    setIsSidebarOpen(false);
  };

  const handleSelectCitation = (citation) => {
    setSelectedCitation(citation);
    setIsInspectorOpen(true);
  };

  const handleSendFollowup = (followupText) => {
    sendMessage(followupText);
  };

  return (
    <div className={`flex flex-col h-screen wallpaper-${theme} text-emerald-50 font-sans antialiased overflow-hidden select-none transition-all duration-500`}>
      {/* Toast Notification for Errors */}
      {error && (
        <div className="fixed top-14 right-4 z-50 p-3.5 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs shadow-2xl backdrop-blur-md flex items-center space-x-3 max-w-md animate-slideDown">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={clearNotifications}
            className="p-1 rounded text-rose-400 hover:text-white hover:bg-rose-900/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toast Notification for Success */}
      {successMessage && (
        <div className="fixed top-14 right-4 z-50 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-400/40 text-emerald-200 text-xs shadow-2xl backdrop-blur-md flex items-center space-x-3 max-w-md animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="flex-1">{successMessage}</span>
          <button
            onClick={clearNotifications}
            className="p-1 rounded text-emerald-400 hover:text-white hover:bg-emerald-900/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DocMind AI Top Navigation Header */}
      <Navbar
        isServerOnline={isServerOnline}
        totalDocuments={documents.length}
        totalChunks={totalChunks}
        currentPersona={persona}
        onSelectPersona={setPersona}
        onOpenInsights={handleOpenInsights}
        onOpenMetrics={handleOpenMetrics}
        onOpenExport={() => setIsExportOpen(true)}
        auth={auth}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Slim Icon Dock (Vertical Navigation Bar) */}
        <nav className="w-14 bg-emerald-950/70 backdrop-blur-xl border-r border-emerald-500/20 flex flex-col items-center justify-between py-3 z-40 shadow-xl flex-shrink-0">
          {/* Top Icon Group */}
          <div className="flex flex-col items-center space-y-3 w-full">
            {/* Knowledge Base Drawer Toggle */}
            <button
              onClick={() => toggleTab('kb')}
              className={`dock-item p-2.5 rounded-xl transition-all ${
                activeTab === 'kb'
                  ? 'dock-item-active'
                  : 'text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
              title="Knowledge Base & Documents"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            {/* Chat Threads Drawer Toggle */}
            <button
              onClick={() => toggleTab('history')}
              className={`dock-item p-2.5 rounded-xl transition-all relative ${
                activeTab === 'history'
                  ? 'dock-item-active'
                  : 'text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
              title="Chat History & Sessions"
            >
              <MessageSquare className="w-5 h-5" />
              {sessions.length > 1 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {sessions.length}
                </span>
              )}
            </button>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="dock-item p-2.5 rounded-xl text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30 transition-all"
              title="New Analysis Thread"
            >
              <SquarePen className="w-5 h-5" />
            </button>

            {/* Upload File Icon */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="dock-item p-2.5 rounded-xl text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30 transition-all"
              title="Upload Document"
            >
              <Database className="w-5 h-5" />
            </button>

            {/* Document Metrics Quick Launch */}
            <button
              onClick={handleOpenMetrics}
              className="dock-item p-2.5 rounded-xl text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30 transition-all"
              title="Document Metrics & Analytics"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </button>

            {/* Document Insights Quick Launch */}
            <button
              onClick={handleOpenInsights}
              className="dock-item p-2.5 rounded-xl text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30 transition-all"
              title="Executive Intelligence & Summary"
            >
              <Sparkles className="w-5 h-5 text-teal-400" />
            </button>
          </div>

          {/* Bottom Icon Group */}
          <div className="flex flex-col items-center space-y-3 w-full">
            {/* Export Quick Launch */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="dock-item p-2.5 rounded-xl text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30 transition-all"
              title="Export Report"
            >
              <Share2 className="w-5 h-5 text-teal-400" />
            </button>

            {/* Settings & Info Icon */}
            <button
              onClick={() => toggleTab('settings')}
              className={`dock-item p-2.5 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'dock-item-active'
                  : 'text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
              title="Settings & System Status"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* Slide-out Sidebar Drawer (Knowledge Base) */}
        <Sidebar
          documents={documents}
          totalChunks={totalChunks}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenMetrics={handleOpenMetrics}
          onDeleteDocument={deleteDocument}
          onClearKnowledgeBase={clearKnowledgeBase}
          isClearing={isClearing}
          isOpen={isSidebarOpen && activeTab === 'kb'}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Slide-out Chat Sessions History Drawer */}
        <ChatSessionsDrawer
          isOpen={isSidebarOpen && activeTab === 'history'}
          onClose={() => setIsSidebarOpen(false)}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSwitchSession={switchSession}
          onCreateSession={createNewSession}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
          onExportSession={(sessionId) => {
            switchSession(sessionId);
            setIsExportOpen(true);
          }}
        />

        {/* Settings & Info Slide-out Panel */}
        {isSidebarOpen && activeTab === 'settings' && (
          <aside className="absolute left-14 top-0 bottom-0 z-40 w-80 glass-panel-light-green border-r border-emerald-500/25 flex flex-col p-4 shadow-2xl animate-slideInRight">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" /> System Info & Settings
              </h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-emerald-400 rounded hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-4 text-xs text-emerald-200">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 space-y-1.5">
                <p className="font-bold text-emerald-100 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" /> Google Gemini API
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Using <code className="text-emerald-300 bg-emerald-900/60 px-1 py-0.5 rounded">GOOGLE_API_KEY</code> in <code className="text-emerald-300 bg-emerald-900/60 px-1 py-0.5 rounded">backend/.env</code>
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">Model: Google Gemini 2.5 / 1.5 Flash</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 space-y-1">
                <p className="font-semibold text-emerald-100">DocMind AI RAG Engine</p>
                <p className="text-[11px] text-emerald-300/80">Backend: {isServerOnline ? 'Online' : 'Offline'}</p>
                <p className="text-[11px] text-emerald-300/80">FAISS Indexing: Active (IndexFlatIP)</p>
                <p className="text-[11px] text-emerald-300/80">Active Persona: <strong className="text-emerald-200 capitalize">{persona}</strong></p>
                <p className="text-[11px] text-emerald-300/80">Active Theme: <strong className="text-emerald-200 capitalize">{theme}</strong></p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-emerald-100">Index Metrics</p>
                  <button
                    onClick={handleOpenMetrics}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <BarChart3 className="w-3 h-3" /> View Detailed
                  </button>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Total Files:</span>
                  <strong className="text-emerald-100">{documents.length}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Vector Chunks:</span>
                  <strong className="text-emerald-100">{totalChunks}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Active Threads:</span>
                  <strong className="text-emerald-100">{sessions.length}</strong>
                </div>
              </div>

              <button
                onClick={clearChatHistory}
                className="w-full py-2 px-3 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 font-medium flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset Active Thread</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Central Viewport */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Mobile Persona Switcher Bar (visible on small screens) */}
          <div className="md:hidden px-4 pt-2.5 flex justify-center bg-emerald-950/50 border-b border-emerald-500/15">
            <PersonaSelector
              currentPersona={persona}
              onSelectPersona={setPersona}
            />
          </div>

          {/* Chat Messages Stream */}
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onOpenUpload={() => setIsUploadOpen(true)}
            totalDocuments={documents.length}
            onSelectCitation={handleSelectCitation}
            onSendFollowup={handleSendFollowup}
            onOpenExport={() => setIsExportOpen(true)}
          />

          {/* Floating Pill Input Container */}
          <ChatInput
            onSendMessage={sendMessage}
            onOpenUpload={() => setIsUploadOpen(true)}
            isLoading={isLoading}
            isServerOnline={isServerOnline}
          />
        </main>
      </div>

      {/* Right Slide-out Source Chunk Inspector */}
      <SourceInspectorDrawer
        citation={selectedCitation}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onDeepDive={(promptText) => sendMessage(promptText)}
      />

      {/* Document Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={uploadFile}
        isUploading={isUploading}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        auth={auth}
      />

      {/* Document Insights & Metrics Modal */}
      <DocumentInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        initialTab={insightsInitialTab}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Conversation Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        exportSession={exportSession}
        currentSessionTitle={currentSession?.title}
        sessions={sessions}
        currentSessionId={currentSessionId}
        persona={persona}
      />
    </div>
  );
}
