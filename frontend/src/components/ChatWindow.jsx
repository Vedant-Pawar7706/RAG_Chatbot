import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import Typing from './Typing';
import { FileText, Bot, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  onOpenUpload,
  totalDocuments,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const samplePrompts = [
    {
      title: 'Summarize Document',
      desc: 'Give a comprehensive summary of the main points in uploaded files.',
      icon: FileText,
    },
    {
      title: 'Extract Key Findings',
      desc: 'List important takeaways, statistics, and specs.',
      icon: Sparkles,
    },
    {
      title: 'Find Specific Clause',
      desc: 'Search for guidelines, definitions, or clauses.',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-6 flex flex-col justify-between">
      {/* Sample starter cards if no messages yet */}
      {messages.length <= 1 ? (
        <div className="max-w-3xl mx-auto my-auto space-y-8 text-center animate-fadeIn py-6">
          {/* Robot Icon & Title */}
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-400/40 text-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/15 backdrop-blur-md">
              <Bot className="w-9 h-9" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-100 tracking-tight">
              Hi, how can I help you today?
            </h2>
            <p className="text-sm md:text-base text-emerald-300/80 max-w-xl mx-auto leading-relaxed">
              {totalDocuments > 0
                ? `You have ${totalDocuments} document(s) indexed in your FAISS vector store. Pick a prompt below or ask anything.`
                : 'Upload your PDF, DOCX, or TXT documents to power your RAG Chatbot.'}
            </p>
          </div>

          {totalDocuments === 0 && (
            <div className="p-5 rounded-2xl glass-card-light-green text-center max-w-md mx-auto space-y-3 border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-sm font-bold text-emerald-100">No Documents Uploaded Yet</p>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
              >
                Upload First File
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {samplePrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt.title)}
                  className="glass-card-light-green p-5 rounded-2xl text-left hover:scale-[1.02] transition-all group space-y-2.5"
                >
                  <Icon className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-emerald-100 group-hover:text-emerald-300">
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-emerald-300/75 leading-relaxed">{prompt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Messages list stream - Increased Width & Sleek Height */
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <Typing />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
