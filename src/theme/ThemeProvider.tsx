import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // When mode or color changes, update <html> class
  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all theme/color/mode classes
    root.className = '';
    root.classList.add(`theme-${color}`);
    root.classList.add(mode);
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
