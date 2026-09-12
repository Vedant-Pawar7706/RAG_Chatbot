import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, auth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Senior Analyst');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (isRegister) {
        if (!name.trim()) return setLocalError('Please enter your full name');
        if (!email.trim()) return setLocalError('Please enter a valid email');
        if (password.length < 4) return setLocalError('Password must be at least 4 characters');
        await auth.register(name, email, password, role);
      } else {
        if (!email.trim() || !password.trim()) return setLocalError('Email and password required');
        await auth.login(email, password);
      }
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Authentication failed');
    }
  };

  const handleDemoClick = async () => {
    setLocalError('');
    try {
      await auth.demoLogin();
      onClose();
    } catch (err) {
      setLocalError('Demo login unavailable');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 overflow-hidden border rounded-3xl glass-panel-light-green border-emerald-500/30 shadow-2xl shadow-emerald-950/80">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-emerald-100">
                {isRegister ? 'Create DocMind AI Account' : 'Welcome to DocMind AI'}
              </h2>
              <p className="text-xs text-emerald-300/80">Enterprise Document Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-400 rounded-lg hover:text-white hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Instant Demo Login Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={auth.isLoading}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/40 text-emerald-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-2 text-left">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <p className="font-bold text-emerald-100 text-xs">1-Click Instant Demo Access</p>
                <p className="text-[10px] text-emerald-300/75">Log in as Dr. Alex Morgan (Lead Researcher)</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-emerald-500/20" />
          <span className="px-3 text-[11px] font-medium text-emerald-400/75 uppercase tracking-wider">or sign in with email</span>
          <div className="flex-1 border-t border-emerald-500/20" />
        </div>

        {/* Error notice */}
        {(localError || auth.error) && (
          <div className="p-3 mb-3 text-xs text-rose-300 rounded-xl bg-rose-950/70 border border-rose-500/30">
            {localError || auth.error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block mb-1 text-xs font-semibold text-emerald-200">Full Name</label>
              <div className="relative">
                <User className="absolute w-4 h-4 text-emerald-400/70 left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-emerald-950/60 border border-emerald-500/25 text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 text-xs font-semibold text-emerald-200">Email Address</label>
            <div className="relative">
              <Mail className="absolute w-4 h-4 text-emerald-400/70 left-3 top-2.5" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-emerald-950/60 border border-emerald-500/25 text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-emerald-200">Password</label>
            <div className="relative">
              <Lock className="absolute w-4 h-4 text-emerald-400/70 left-3 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-emerald-950/60 border border-emerald-500/25 text-emerald-100 placeholder-emerald-500/50 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block mb-1 text-xs font-semibold text-emerald-200">Role / Title</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-emerald-950/60 border border-emerald-500/25 text-emerald-100 focus:outline-none focus:border-emerald-400"
              >
                <option value="Senior Analyst" className="bg-slate-900 text-emerald-100">Senior Research Analyst</option>
                <option value="Legal Counsel" className="bg-slate-900 text-emerald-100">Legal & Compliance Auditor</option>
                <option value="Executive" className="bg-slate-900 text-emerald-100">Executive / Director</option>
                <option value="Engineer" className="bg-slate-900 text-emerald-100">Systems Architect</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={auth.isLoading}
            className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-98 flex items-center justify-center space-x-1.5"
          >
            {auth.isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isRegister ? 'Complete Registration' : 'Sign In to Workspace'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setLocalError('');
            }}
            className="text-xs text-emerald-400 hover:text-emerald-200 transition-colors"
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : "Don't have an account? Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
}
