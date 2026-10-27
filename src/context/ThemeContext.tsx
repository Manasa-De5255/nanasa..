import React, { createContext, useContext, useState, useEffect } from 'react';
import { PortalTheme, ThemeMode } from '../types/index.ts';

interface ThemeDefinition {
  id: PortalTheme;
  name: string;
  description: string;
  previewColors: {
    primary: string;
    secondary: string;
    surface: string;
    accent: string;
  };
}

export const THEME_LIST: ThemeDefinition[] = [
  {
    id: 'academic-blue',
    name: 'Academic Blue',
    description: 'Navy blue, white, and light blue. Professional, clean, and suitable for everyday college use.',
    previewColors: {
      primary: '#0B2545',
      secondary: '#134074',
      surface: '#FFFFFF',
      accent: '#2A6F97',
    },
  },
  {
    id: 'elegant-cream',
    name: 'Elegant Cream',
    description: 'Warm cream, white, muted gold, and dark navy. Calm, scholarly, and sophisticated.',
    previewColors: {
      primary: '#1C2333',
      secondary: '#354259',
      surface: '#FAF8F5',
      accent: '#B08938',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Deep maritime blue, soft cyan, and crisp white. Fresh, open, and modern.',
    previewColors: {
      primary: '#0D3B66',
      secondary: '#007791',
      surface: '#F0F6F9',
      accent: '#00A896',
    },
  },
  {
    id: 'midnight-pro',
    name: 'Midnight Professional',
    description: 'Dark navy canvas, deep slate structural surfaces, and radiant soft blue text.',
    previewColors: {
      primary: '#0A111F',
      secondary: '#121B2F',
      surface: '#1B2640',
      accent: '#38BDF8',
    },
  },
  {
    id: 'sage-ivory',
    name: 'Sage & Ivory',
    description: 'Muted sage green, ivory, and soft charcoal. Minimal, peaceful, and grounded.',
    previewColors: {
      primary: '#385648',
      secondary: '#4A6B5D',
      surface: '#F8F8F5',
      accent: '#688B77',
    },
  },
];

interface ThemeContextType {
  theme: PortalTheme;
  mode: ThemeMode;
  setTheme: (theme: PortalTheme) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  currentThemeDef: ThemeDefinition;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<PortalTheme>(() => {
    const saved = localStorage.getItem('unicore_theme');
    if (saved && THEME_LIST.some(t => t.id === saved)) {
      return saved as PortalTheme;
    }
    return 'academic-blue'; // Default theme as requested
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('unicore_mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
    localStorage.setItem('unicore_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-mode', mode);
    localStorage.setItem('unicore_mode', mode);
  }, [mode]);

  const setTheme = (newTheme: PortalTheme) => {
    setThemeState(newTheme);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentThemeDef = THEME_LIST.find(t => t.id === theme) || THEME_LIST[0];

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode, currentThemeDef }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
