import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

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
  const [settings, setSettings] = useState<Settings>(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return { ...DEFAULT_SETTINGS, darkMode: true };
    }
    return DEFAULT_SETTINGS;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading settings', error);
        } else if (data) {
          setSettings({
            darkMode: data.dark_mode ?? false,
            geminiApiKey: data.gemini_api_key || '',
            geminiModel: data.gemini_model || 'gemini-2.5-flash',
          });
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [userId]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (!userId) return;

    try {
      const { error } = await supabase.from('user_settings').upsert({
        user_id: userId,
        gemini_api_key: newSettings.geminiApiKey,
        gemini_model: newSettings.geminiModel,
        dark_mode: newSettings.darkMode,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Error saving settings to Supabase', error);
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  return {
    settings,
    updateSettings,
    settingsLoading: loading,
  };
}
