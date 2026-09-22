// Dynamic Multi-Accent Color System
export const THEME_ACCENTS = {
  indigo: {
    id: 'indigo',
    name: 'Electric Indigo',
    colorHex: '#6366f1',
    hoverHex: '#4f46e5',
    activeHsl: '238 84% 62%',
    hoverHsl: '239 84% 57%',
    lightHsl: '240 100% 97%',
    glow: 'rgba(99, 102, 241, 0.45)',
    gradient: 'from-indigo-600 via-indigo-500 to-purple-600',
    badgeClass: 'bg-indigo-500',
  },
  violet: {
    id: 'violet',
    name: 'Cyberpunk Violet',
    colorHex: '#8b5cf6',
    hoverHex: '#7c3aed',
    activeHsl: '258 90% 66%',
    hoverHsl: '263 70% 50%',
    lightHsl: '260 100% 98%',
    glow: 'rgba(139, 92, 246, 0.45)',
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-600',
    badgeClass: 'bg-violet-500',
  },
  rose: {
    id: 'rose',
    name: 'Sunset Rose',
    colorHex: '#f43f5e',
    hoverHex: '#e11d48',
    activeHsl: '347 77% 60%',
    hoverHsl: '347 77% 50%',
    lightHsl: '350 100% 98%',
    glow: 'rgba(244, 63, 94, 0.45)',
    gradient: 'from-rose-500 via-pink-500 to-orange-500',
    badgeClass: 'bg-rose-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Neo Matrix',
    colorHex: '#10b981',
    hoverHex: '#059669',
    activeHsl: '160 84% 39%',
    hoverHsl: '161 94% 30%',
    lightHsl: '152 76% 97%',
    glow: 'rgba(16, 185, 129, 0.45)',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    badgeClass: 'bg-emerald-500',
  },
  cyan: {
    id: 'cyan',
    name: 'Ocean Cyan',
    colorHex: '#06b6d4',
    hoverHex: '#0891b2',
    activeHsl: '189 94% 43%',
    hoverHsl: '192 91% 36%',
    lightHsl: '186 100% 97%',
    glow: 'rgba(6, 182, 212, 0.45)',
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    badgeClass: 'bg-cyan-500',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    colorHex: '#f59e0b',
    hoverHex: '#d97706',
    activeHsl: '38 92% 50%',
    hoverHsl: '32 95% 44%',
    lightHsl: '48 100% 96%',
    glow: 'rgba(245, 158, 11, 0.45)',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    badgeClass: 'bg-amber-500',
  },
};

export const applyThemeAccent = (accentId) => {
  const accent = THEME_ACCENTS[accentId] || THEME_ACCENTS.indigo;
  const root = document.documentElement;

  root.style.setProperty('--brand', accent.activeHsl);
  root.style.setProperty('--brand-hover', accent.hoverHsl);
  root.style.setProperty('--brand-light', accent.lightHsl);
  root.style.setProperty('--brand-glow', accent.glow);
  root.style.setProperty('--accent-hex', accent.colorHex);
  root.style.setProperty('--accent-hover-hex', accent.hoverHex);

  localStorage.setItem('socialdb-accent-theme', accent.id);
  return accent;
};

export const getInitialAccent = () => {
  if (typeof window === 'undefined') return 'indigo';
  const saved = localStorage.getItem('socialdb-accent-theme');
  return THEME_ACCENTS[saved] ? saved : 'indigo';
};
