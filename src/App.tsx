import { useState, useEffect } from 'react';
import { Package, PlusCircle, Settings, List } from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import { useSettings } from './hooks/useSettings';
import { InventoryList } from './components/InventoryList';
import { AddItemForm } from './components/AddItemForm';
import { SettingsPanel } from './components/SettingsPanel';

import { AuthForm } from './components/AuthForm';
import { supabase } from './services/supabase';

function MainApp({ session }: { session: any }) {
  const { items, categories, addItem, updateItem, deleteItem, loading: inventoryLoading } = useInventory(session.user.id);
  const { settings, updateSettings, settingsLoading } = useSettings(session.user.id);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'settings'>('list');

  const handleAddItem = (item: any) => {
    addItem(item);
    setActiveTab('list');
  };

  const loading = inventoryLoading || settingsLoading;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => setActiveTab('list')}
          >
            <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-900 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent hidden sm:block">
              Smart Stocker
            </h1>
          </div>
          
          <nav className="flex items-center space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'list' 
                  ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">在庫一覧</span>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'add' 
                  ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">新規登録</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:block">設定</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
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
  const [session, setSession] = useState<any>(null);
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
