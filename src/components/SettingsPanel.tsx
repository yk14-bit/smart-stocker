import { Moon, Sun, Key, Save, X } from 'lucide-react';
import type { Settings } from '../hooks/useSettings';
import { useState } from 'react';

interface Props {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onUpdate, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [modelName, setModelName] = useState(settings.geminiModel || 'gemini-2.5-flash');

  const handleSave = () => {
    onUpdate({ geminiApiKey: apiKey, geminiModel: modelName });
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">設定</h2>
        <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
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
          className="w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          <Save className="w-5 h-5" />
          <span>設定を保存</span>
        </button>
      </div>
    </div>
  );
}
