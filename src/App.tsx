import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Activity, List, Package, PlusCircle, Settings } from 'lucide-react';
import type { InventoryItem } from './types';
import { useInventory } from './hooks/useInventory';
import { useSettings } from './hooks/useSettings';
import { InventoryList } from './components/InventoryList';
import { AddItemForm } from './components/AddItemForm';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';

import { AuthForm } from './components/AuthForm';
import { supabase } from './services/supabase';

type AppTab = 'list' | 'history' | 'add' | 'settings';

function MainApp({ session }: { session: Session }) {
  const { items, categories, addItem, updateItem, deleteItem, loading: inventoryLoading } = useInventory(session.user.id);
  const { settings, updateSettings, settingsLoading } = useSettings(session.user.id);
  const [activeTab, setActiveTab] = useState<AppTab>('list');

  const handleAddItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    addItem(item);
    setActiveTab('list');
  };

  const loading = inventoryLoading || settingsLoading;
  const navItems = [
    { id: 'list' as const, label: '在庫一覧', icon: List },
    { id: 'history' as const, label: '変更履歴', icon: Activity },
    { id: 'add' as const, label: '新規登録', icon: PlusCircle },
    { id: 'settings' as const, label: '設定', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
          <div
            className="inline-flex items-center space-x-2 cursor-pointer"
            onClick={() => setActiveTab('list')}
          >
            <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-900 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
              Smart Stocker
            </h1>
          </div>

          <nav className="grid grid-cols-4 gap-2 rounded-xl bg-gray-100 dark:bg-gray-900 p-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`min-w-0 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-white text-primary-600 dark:bg-gray-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-500 hover:bg-white/60 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">データを読み込み中...</p>
          </div>
        ) : (
          <>
            {activeTab === 'list' && (
              <InventoryList
                items={items}
                categories={categories}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                userId={session.user.id}
              />
            )}
            {activeTab === 'history' && (
              <HistoryPanel userId={session.user.id} />
            )}
            {activeTab === 'add' && (
              <AddItemForm
                categories={categories}
                onAdd={handleAddItem}
                onCancel={() => setActiveTab('list')}
                userId={session.user.id}
              />
            )}
            {activeTab === 'settings' && (
              <div className="max-w-lg mx-auto">
                <SettingsPanel
                  settings={settings}
                  onUpdate={updateSettings}
                  onClose={() => setActiveTab('list')}
                  session={session}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return <MainApp session={session} />;
}

export default App;
