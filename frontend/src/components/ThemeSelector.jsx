import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/25 text-emerald-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
        title="Change Visual Theme"
      >
        <Palette className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-3 rounded-2xl glass-panel-light-green border border-emerald-500/30 shadow-2xl z-50 animate-slideDown">
          <div className="pb-2 mb-2 border-b border-emerald-500/20">
            <h4 className="text-xs font-bold text-emerald-100 flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Theme Aesthetics</span>
            </h4>
            <p className="text-[10px] text-emerald-300/70">Select interface styling</p>
          </div>

          <div className="space-y-1.5">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-900/60 border border-emerald-400/40 text-emerald-100 font-bold'
                      : 'hover:bg-emerald-900/30 text-emerald-300/85 font-medium'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <span>{t.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
