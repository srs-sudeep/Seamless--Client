import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes } from './themes';
import { ColorTheme, ThemeMode, ThemeConfig } from './types';

const DEFAULT_COLOR: ColorTheme = 'blue';
const DEFAULT_MODE: ThemeMode = 'light';
const DARK_DEFAULT_COLOR: ColorTheme = 'pink';
const LIGHT_DEFAULT_COLOR: ColorTheme = 'blue';
const STORAGE_KEY = 'app-theme-config';

interface ThemeProviderState {
  mode: ThemeMode;
  color: ColorTheme;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ColorTheme) => void;
  setTheme: (config: Partial<ThemeConfig>) => void;
}

const initialState: ThemeProviderState = {
  mode: DEFAULT_MODE,
  color: DEFAULT_COLOR,
  setMode: () => {},
  setColor: () => {},
  setTheme: () => {},
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function applyThemeVars(color: ColorTheme, mode: ThemeMode) {
  const themeVars = themes[color][mode];
  const root = window.document.documentElement;
  // Remove all color classes
  Object.keys(themes).forEach(c => {
    root.classList.remove(`theme-${c}`);
  });
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
  root.classList.add(`theme-${color}`);
  // Set CSS variables
  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(`--${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`, value);
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return (JSON.parse(stored).mode as ThemeMode) || DEFAULT_MODE;
      } catch (e) {
        console.error('Failed to parse theme mode from localStorage:', e);
      }
    }
    return DEFAULT_MODE;
  });
  const [color, setColorState] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return (JSON.parse(stored).color as ColorTheme) || DEFAULT_COLOR;
      } catch (e) {
        console.error('Failed to parse theme color from localStorage:', e);
      }
    }
    return DEFAULT_COLOR;
  });

  // When mode changes, auto-switch color if needed
  React.useEffect(() => {
    if (mode === 'dark' && color === LIGHT_DEFAULT_COLOR) {
      setColorState(DARK_DEFAULT_COLOR);
    } else if (mode === 'light' && color === DARK_DEFAULT_COLOR) {
      setColorState(LIGHT_DEFAULT_COLOR);
    }
  }, [mode]);

  useEffect(() => {
    applyThemeVars(color, mode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, color }));
  }, [mode, color]);

  const setTheme = (config: Partial<ThemeConfig>) => {
    if (config.mode) setModeState(config.mode);
    if (config.color) setColorState(config.color);
  };

  return (
    <ThemeProviderContext.Provider
      value={{
        mode,
        color,
        setMode: setModeState,
        setColor: setColorState,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
