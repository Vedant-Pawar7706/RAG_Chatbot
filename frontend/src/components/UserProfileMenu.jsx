import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShieldCheck, ChevronDown, Sparkles, LogIn } from 'lucide-react';

export default function UserProfileMenu({ auth, onOpenAuth }) {
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

  if (!auth.isAuthenticated) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  const user = auth.user;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-500/25 transition-all group"
      >
        {/* User avatar styled according to theme */}
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-400 via-green-500 to-teal-300 p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
          <div className="w-full h-full bg-emerald-950 rounded-[6px] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-emerald-300" />
          </div>
        </div>
        <span className="text-xs font-semibold text-emerald-100 max-w-[120px] truncate hidden sm:inline-block">
          {user.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl glass-panel-light-green border border-emerald-500/30 shadow-2xl z-50 animate-slideDown">
          {/* User Info Header */}
          <div className="flex items-center space-x-3 pb-3 border-b border-emerald-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 via-green-500 to-teal-300 p-0.5 shadow-md shadow-emerald-500/25 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-300" />
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-emerald-100 truncate">{user.name}</p>
              <p className="text-[11px] text-emerald-300/70 truncate">{user.email}</p>
              <p className="text-[10px] text-emerald-400 font-medium">{user.role}</p>
            </div>
          </div>

          {/* Plan badge */}
          <div className="my-2.5 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{user.plan || 'Enterprise Pro'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuth();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-200 hover:bg-emerald-900/50 flex items-center space-x-2 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch Account</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                auth.logout();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-950/50 flex items-center space-x-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
