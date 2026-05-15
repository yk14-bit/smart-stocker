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

export function useSettings(userId: string) {
  const settingsKey = `smart-stocker-settings-${userId}`;

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(settingsKey);
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
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, settingsKey]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return {
    settings,
    updateSettings,
  };
}
