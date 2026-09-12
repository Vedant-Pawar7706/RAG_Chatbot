import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, Mic, MicOff } from 'lucide-react';

export default function ChatInput({ onSendMessage, onOpenUpload, isLoading, isServerOnline }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setQuery((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Error starting speech recognition:', e);
      }
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (!query.trim() || isLoading || !isServerOnline) return;
    onSendMessage(query);
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5 pt-1 z-20">
      <form onSubmit={handleSubmit} className="relative">
        {/* Copilot Pill Input Box */}
        <div className={`copilot-pill-input px-5 py-3.5 flex flex-col justify-between min-h-[84px] text-slate-800 shadow-2xl transition-all ${
          isListening ? 'ring-2 ring-emerald-500 shadow-emerald-500/30' : ''
        }`}>
          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? '🎙️ Listening to your voice... Speak now.'
                : isServerOnline
                ? 'Ask anything or search your documents...'
                : 'Backend server is offline. Please start FastAPI backend.'
            }
            disabled={!isServerOnline || isLoading}
            className="w-full bg-transparent text-base font-medium text-slate-900 placeholder-slate-400/90 focus:outline-none resize-none max-h-36 custom-scrollbar disabled:opacity-60"
          />

          {/* Action Bar inside Pill Box */}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 mt-1.5">
            {/* Left Tools: Attachment */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="w-8 h-8 rounded-full border border-slate-300/80 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
              title="Add attachment / Upload document"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            {/* Right Tools: Mic & Send */}
            <div className="flex items-center space-x-2">
              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isListening
                    ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-rose-500/30 ring-2 ring-rose-400/50'
                    : 'border-slate-300/80 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                }`}
                title={isListening ? 'Stop recording voice' : 'Dictate question with voice'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!query.trim() || isLoading || !isServerOnline}
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white disabled:text-slate-400 shadow-md transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                title="Send Message"
              >
                <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
