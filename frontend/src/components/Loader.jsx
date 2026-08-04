import React from 'react';

export default function Loader({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex items-center justify-center space-x-2 text-slate-400">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-indigo-500 border-t-transparent rounded-full animate-spin`}
      />
      {text && <span className="text-xs font-medium text-slate-400">{text}</span>}
    </div>
  );
}
