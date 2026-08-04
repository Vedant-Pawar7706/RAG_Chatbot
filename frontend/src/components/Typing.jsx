import React from 'react';
import { Bot } from 'lucide-react';

export default function Typing() {
  return (
    <div className="flex items-center space-x-3">
      {/* Bot Avatar Logo */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
        <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
          <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Thinking Indicator Bubble */}
      <div className="flex items-center space-x-2 px-4 py-2.5 glass-panel-light-green border border-emerald-500/25 rounded-2xl rounded-tl-none text-emerald-50 shadow-md backdrop-blur-md">
        <Bot className="w-4 h-4 text-emerald-400 animate-pulse mr-0.5" />
        <span className="text-xs font-semibold text-emerald-300 animate-pulse">
          Gemini is thinking
        </span>
        <div className="flex items-center space-x-1 ml-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-emerald-400/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-emerald-400/50 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

