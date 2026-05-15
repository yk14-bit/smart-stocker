import { useState } from 'react';
import { Package, PlusCircle, Settings, List } from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import { useSettings } from './hooks/useSettings';
import { InventoryList } from './components/InventoryList';
import { AddItemForm } from './components/AddItemForm';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const { items, categories, addItem, updateItem } = useInventory();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'settings'>('list');

  const handleAddItem = (item: any) => {
    addItem(item);
    setActiveTab('list');
  };

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
        {activeTab === 'list' && (
          <InventoryList items={items} categories={categories} onUpdateItem={updateItem} />
        )}
        {activeTab === 'add' && (
          <AddItemForm 
            categories={categories} 
            onAdd={handleAddItem}
            onCancel={() => setActiveTab('list')}
          />
        )}
        {activeTab === 'settings' && (
          <div className="max-w-lg mx-auto">
            <SettingsPanel 
              settings={settings}
              onUpdate={updateSettings}
              onClose={() => setActiveTab('list')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
