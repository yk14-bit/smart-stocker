import { Moon, Sun, Key, Save, X, LogOut, User } from 'lucide-react';
import type { Settings } from '../hooks/useSettings';
import type { Session } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '../services/supabase';

interface Props {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onClose: () => void;
  session: Session;
}

export function SettingsPanel({ settings, onUpdate, onClose, session }: Props) {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [modelName, setModelName] = useState(settings.geminiModel || 'gemini-2.5-flash');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({ geminiApiKey: apiKey, geminiModel: modelName });
    setIsSaving(false);
    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">設定</h2>
        <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Account Info */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">アカウント</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>ログアウト</span>
        </button>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="flex items-center space-x-3">
          {settings.darkMode ? (
            <Moon className="w-5 h-5 text-indigo-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">外観モード</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ダークモードの切り替え</p>
          </div>
        </div>
        <button
          onClick={() => onUpdate({ darkMode: !settings.darkMode })}
          className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
            settings.darkMode ? 'bg-indigo-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
              settings.darkMode ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* API Key Input */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <label className="font-medium text-gray-900 dark:text-white">Gemini API キー</label>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          写真からの自動情報入力（商品名・価格等のAI推測）を使用するために必要です。
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Model Selection */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <label className="font-medium text-gray-900 dark:text-white">Gemini モデル名</label>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          使用するAIモデルのIDを指定します。(例: gemini-3.1-flash, gemini-3.1-flash-lite, gemini-2.5-flash)
        </p>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="例: gemini-3.1-flash"
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-primary-700 active:bg-primary-800 disabled:opacity-70 transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
          <span>{isSaving ? '保存中...' : '設定を保存'}</span>
        </button>
      </div>
    </div>
  );
}
