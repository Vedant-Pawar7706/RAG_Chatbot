import React from 'react';
import { GraduationCap, Zap, Scale, Cpu } from 'lucide-react';

export const PERSONAS = [
  {
    id: 'analyst',
    label: 'Research Analyst',
    short: 'Analyst',
    icon: GraduationCap,
    desc: 'Exhaustive document citations & rigorous objective analysis',
  },
  {
    id: 'executive',
    label: 'Executive Brief',
    short: 'Executive',
    icon: Zap,
    desc: 'High-level summaries, bulleted takeaways & strategic TL;DR',
  },
  {
    id: 'legal',
    label: 'Legal Auditor',
    short: 'Legal',
    icon: Scale,
    desc: 'Clause scrutiny, compliance boundaries & risk mitigation',
  },
  {
    id: 'architect',
    label: 'Tech Architect',
    short: 'Architect',
    icon: Cpu,
    desc: 'System specifications, patterns & engineering requirements',
  },
];

export default function PersonaSelector({ currentPersona, onSelectPersona }) {
  return (
    <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-emerald-950/70 border border-emerald-500/20 backdrop-blur-md">
      {PERSONAS.map((p) => {
        const Icon = p.icon;
        const isActive = currentPersona === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPersona(p.id)}
            title={p.desc}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
                : 'text-emerald-300/80 hover:text-emerald-100 hover:bg-emerald-900/40'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline-block">{p.label}</span>
            <span className="sm:hidden">{p.short}</span>
          </button>
        );
      })}
    </div>
  );
}
