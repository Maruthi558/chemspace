import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  preferences: {},
  updatePreference: () => {},
  resetPreferences: () => {}
});

const DEFAULT_PREFERENCES = {
  defaultRenderMode: 'ball-stick',
  autoRotate3D: true,
  showAtomLabels: true,
  precision: 2,
  calcEnginePreference: 'auto', // 'auto', 'local_fastapi', 'client_wasm'
  soundEffects: false
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem('chemspace_theme');
      if (stored) return stored;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('chemspace_preferences');
      if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCES;
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('chemspace_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('chemspace_preferences', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem('chemspace_preferences', JSON.stringify(DEFAULT_PREFERENCES));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, preferences, updatePreference, resetPreferences }}>
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

export default ThemeContext;
