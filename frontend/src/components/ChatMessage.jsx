import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Bookmark,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ChatMessage({ message, onSelectCitation, onSendFollowup }) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';
  const citations = message.citations || [];
  const followups = message.suggestedFollowups || message.suggested_followups || [];

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Strip markdown symbols for natural speech readout
      const cleanText = message.content
        .replace(/[*#_`~[\]()]/g, ' ')
        .replace(/\n+/g, '. ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className={`flex space-x-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Robot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
          <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      )}

      <div className={`${isUser ? 'max-w-[92%] sm:max-w-[85%]' : 'max-w-[94%] sm:max-w-[88%]'} space-y-2`}>
        {/* Main Message Bubble */}
        <div
          className={`relative px-4 pt-2.5 ${!isUser ? 'pb-8' : 'pb-2.5'} rounded-2xl text-sm leading-snug backdrop-blur-md shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 text-white rounded-tr-none shadow-emerald-600/20 font-medium'
              : 'glass-panel-light-green text-emerald-50 rounded-tl-none border border-emerald-500/25'
          }`}
        >
          {/* Header Metadata */}
          <div className="flex items-center justify-between mb-1.5 text-[11px] opacity-75 border-b border-emerald-500/10 pb-1">
            <span className="font-bold flex items-center gap-1.5">
              {isUser ? 'You' : 'DocMind AI'}
              {!isUser && message.persona && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
                  {message.persona}
                </span>
              )}
            </span>
            <span className="font-mono text-emerald-300/80">{message.timestamp}</span>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-invert prose-emerald max-w-none break-words text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>

          {/* Assistant Action Buttons (TTS Audio & Copy) */}
          {!isUser && (
            <div className="absolute bottom-2 right-2.5 flex items-center space-x-1.5">
              {/* Text-to-Speech Button */}
              <button
                onClick={handleToggleSpeech}
                className={`p-1.5 rounded-lg border text-[11px] font-medium shadow-sm transition-all ${
                  isSpeaking
                    ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'
                    : 'bg-emerald-900/75 hover:bg-emerald-800 border-emerald-500/30 text-emerald-300 hover:text-emerald-100'
                }`}
                title={isSpeaking ? 'Stop audio voice' : 'Listen to response (TTS)'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="px-2 py-1 rounded-lg bg-emerald-900/75 hover:bg-emerald-800 border border-emerald-500/30 text-emerald-300 hover:text-emerald-100 transition-colors flex items-center gap-1 text-[11px] font-medium shadow-sm"
                title="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Citations & Sources Accordion */}
        {!isUser && citations.length > 0 && (
          <div className="rounded-xl glass-card-light-green border border-emerald-500/20 overflow-hidden">
            <button
              onClick={() => setShowSources(!showSources)}
              className="w-full px-3.5 py-1.5 flex items-center justify-between text-xs font-bold text-emerald-200 hover:bg-emerald-900/40 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Retrieved Sources ({citations.length}{' '}
                  {citations.length === 1 ? 'citation' : 'citations'})
                </span>
              </div>
              {showSources ? (
                <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {showSources && (
              <div className="p-2.5 border-t border-emerald-500/20 space-y-2 bg-emerald-950/60">
                {citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-500/20 text-xs space-y-1.5 group hover:border-emerald-400/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-300 flex items-center">
                        <FileText className="w-3 h-3 mr-1 text-emerald-400" />
                        {cite.source} {cite.page ? `(Page ${cite.page})` : ''}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {(cite.score * 100).toFixed(1)}% match
                        </span>
                        {onSelectCitation && (
                          <button
                            onClick={() => onSelectCitation(cite)}
                            className="p-1 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
                            title="Inspect full chunk in drawer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-emerald-200/90 italic bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/15 leading-relaxed cursor-pointer hover:text-emerald-100"
                       onClick={() => onSelectCitation && onSelectCitation(cite)}>
                      "{cite.text}..."
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Suggested Follow-Up Questions */}
        {!isUser && followups.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold text-emerald-400/90 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Suggested Follow-ups:
            </p>
            <div className="flex flex-wrap gap-2">
              {followups.map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => onSendFollowup && onSendFollowup(suggestion)}
                  className="text-left px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/30 hover:border-emerald-400/60 text-emerald-200 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-98 flex items-center space-x-1.5 group"
                >
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">↳</span>
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-green-600 to-teal-500 p-0.5 shadow-md flex items-center justify-center flex-shrink-0 mt-0.5">
          <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center text-emerald-300">
            <User className="w-4 h-4 text-emerald-300" />
          </div>
        </div>
      )}
    </div>
  );
}
