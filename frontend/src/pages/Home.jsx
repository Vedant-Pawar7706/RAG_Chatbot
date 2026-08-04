import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import UploadModal from '../components/UploadModal';
import {
  AlertCircle,
  CheckCircle2,
  X,
  BookOpen,
  SquarePen,
  History,
  Compass,
  Settings,
  LayoutGrid,
  Sparkles,
  Database,
  Trash2,
  Key,
} from 'lucide-react';

export default function Home() {
  const {
    messages,
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
  } = useChat();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'kb', 'history', 'discover', 'settings', null
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    clearChatHistory();
    setActiveTab(null);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen copilot-wallpaper text-emerald-50 font-sans antialiased overflow-hidden select-none">
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

      {/* RAG Chatbot Windows Style Header */}
      <Navbar
        isServerOnline={isServerOnline}
        totalDocuments={documents.length}
        totalChunks={totalChunks}
        onClearChat={handleNewChat}
        onOpenUpload={() => setIsUploadOpen(true)}
        onRefresh={refreshData}
      />

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Slim Icon Dock (Vertical Navigation Bar) */}
        <nav className="w-14 bg-emerald-950/70 backdrop-blur-xl border-r border-emerald-500/20 flex flex-col items-center justify-between py-3 z-50 shadow-xl flex-shrink-0">
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

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="dock-item p-2.5 rounded-xl text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30 transition-all"
              title="New Chat / Clear Canvas"
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

            {/* Discover / Prompts Icon */}
            <button
              onClick={() => toggleTab('discover')}
              className={`dock-item p-2.5 rounded-xl transition-all ${
                activeTab === 'discover'
                  ? 'dock-item-active'
                  : 'text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
              title="Discover & Starter Prompts"
            >
              <Compass className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Icon Group */}
          <div className="flex flex-col items-center space-y-3 w-full">
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

            {/* Apps / Layout Toggle */}
            <button
              onClick={() => toggleTab('grid')}
              className={`dock-item p-2.5 rounded-xl transition-all ${
                activeTab === 'grid'
                  ? 'dock-item-active'
                  : 'text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`}
              title="All Panels"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {/* Slide-out Sidebar Drawer (Knowledge Base) */}
        <Sidebar
          documents={documents}
          totalChunks={totalChunks}
          onOpenUpload={() => setIsUploadOpen(true)}
          onDeleteDocument={deleteDocument}
          onClearKnowledgeBase={clearKnowledgeBase}
          isClearing={isClearing}
          isOpen={isSidebarOpen && (activeTab === 'kb' || activeTab === 'grid')}
          onClose={() => setIsSidebarOpen(false)}
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
                className="p-1 text-emerald-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-4 text-xs text-emerald-200">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 space-y-1.5">
                <p className="font-bold text-emerald-100 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" /> Google API Key
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Using <code className="text-emerald-300 bg-emerald-900/60 px-1 py-0.5 rounded">GOOGLE_API_KEY</code> in <code className="text-emerald-300 bg-emerald-900/60 px-1 py-0.5 rounded">backend/.env</code>
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">Model: Google Gemini 2.5 / 1.5 Flash</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 space-y-1">
                <p className="font-semibold text-emerald-100">RAG Engine Status</p>
                <p className="text-[11px] text-emerald-300/80">Backend: {isServerOnline ? 'Online' : 'Offline'}</p>
                <p className="text-[11px] text-emerald-300/80">FAISS Indexing: Active</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/20 space-y-2">
                <p className="font-semibold text-emerald-100">Index Metrics</p>
                <div className="flex justify-between text-[11px]">
                  <span>Total Files:</span>
                  <strong className="text-emerald-100">{documents.length}</strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Vector Chunks:</span>
                  <strong className="text-emerald-100">{totalChunks}</strong>
                </div>
              </div>

              <button
                onClick={clearChatHistory}
                className="w-full py-2 px-3 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 font-medium flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset Chat Stream</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Central Viewport */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Chat Messages Stream */}
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onOpenUpload={() => setIsUploadOpen(true)}
            totalDocuments={documents.length}
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

      {/* Document Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={uploadFile}
        isUploading={isUploading}
      />
    </div>
  );
}
