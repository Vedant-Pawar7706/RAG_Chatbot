import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'emerald',
    name: 'Emerald Meadow',
    accentColor: '#10b981',
    gradient: 'from-emerald-400 to-teal-300',
    wallpaper: 'wallpaper-emerald',
    badge: 'Lush Forest Glass',
    desc: 'Lush deep emerald with frosted glassmorphism',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Indigo',
    accentColor: '#6366f1',
    gradient: 'from-indigo-400 via-purple-500 to-pink-400',
    wallpaper: 'wallpaper-cosmic',
    badge: 'Deep Space Nebula',
    desc: 'Midnight indigo & violet space aesthetics',
  },
  {
    id: 'obsidian',
    name: 'Sleek Obsidian',
    accentColor: '#94a3b8',
    gradient: 'from-slate-300 to-zinc-400',
    wallpaper: 'wallpaper-obsidian',
    badge: 'Minimalist Carbon',
    desc: 'Ultra-clean monochromatic graphite dark mode',
  },
  {
    id: 'amber',
    name: 'Amber Cyberpunk',
    accentColor: '#f59e0b',
    gradient: 'from-amber-400 via-orange-500 to-yellow-300',
    wallpaper: 'wallpaper-amber',
    badge: 'Golden Glow',
    desc: 'Warm golden amber with rich cyber neon accents',
  },
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('docmind_theme') || 'emerald';
  });

  useEffect(() => {
    localStorage.setItem('docmind_theme', theme);
  }, [theme]);

  const currentThemeMeta = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentThemeMeta,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
