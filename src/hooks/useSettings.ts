import { useState, useEffect } from 'react';

export interface Settings {
  darkMode: boolean;
  geminiApiKey: string;
  geminiModel: string;
}

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('smart-stocker-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return { ...DEFAULT_SETTINGS, darkMode: true };
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('smart-stocker-settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return {
    settings,
    updateSettings,
  };
}
