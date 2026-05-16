import { lazy, Suspense, useMemo, useState } from 'react';
import { Edit2, Image as ImageIcon, Package, Search, Sparkles, Tag, TrendingUp } from 'lucide-react';
import type { Category, InventoryItem } from '../types';
import { EditItemModal } from './EditItemModal';

const AIAnalysisModal = lazy(() =>
  import('./AIAnalysisModal').then((module) => ({ default: module.AIAnalysisModal }))
);

interface Props {
  items: InventoryItem[];
  categories: Category[];
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  userId: string;
}

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`;
}

export function InventoryList({ items, categories, onUpdateItem, onDeleteItem, userId }: Props) {
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item && item.id)
      .filter((item) => {
        const quantity = item.quantity ?? 1;
        const matchesCategory = filter === 'all' || item.categoryId === filter;
        const matchesStatus =
          statusFilter === 'all' ? true :
          statusFilter === 'in_stock' ? quantity > 0 :
          quantity === 0;
        const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const aInStock = (a.quantity ?? 1) > 0;
        const bInStock = (b.quantity ?? 1) > 0;
        if (aInStock && !bInStock) return -1;
        if (!aInStock && bInStock) return 1;
        return 0;
      });
  }, [filter, items, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="アイテムを検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <select
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">すべての在庫状態</option>
            <option value="in_stock">在庫あり</option>
            <option value="out_of_stock">在庫なし</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <Package className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p>アイテムが見つかりません</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const quantity = item.quantity ?? 1;
            const isOutOfStock = quantity === 0;
            return (
              <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col relative ${isOutOfStock ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div
                  className="aspect-square bg-gray-50 dark:bg-gray-900 relative flex items-center justify-center cursor-pointer group-hover:opacity-90 transition-opacity"
                  onClick={() => item.imageUrl && setSelectedItem(item)}
                >
                  {item.imageUrl ? (
                    <>
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  )}
                  <div className={`absolute top-2 right-2 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium shadow-sm ${isOutOfStock ? 'bg-red-500/90 text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100'}`}>
                    {item.status || (isOutOfStock ? '在庫なし' : '在庫あり')}
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-8">{item.name || '名称未設定'}</h3>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 justify-between">
                    <div className="flex items-center truncate">
                      <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{categoryNameById.get(item.categoryId) || '未分類'}</span>
                    </div>
                    <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-md font-medium ${isOutOfStock ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {quantity}個
                    </span>
                  </div>

                  <div className="space-y-1">
                    {item.actualPrice !== undefined && (
                      <p className="text-primary-600 dark:text-primary-400 font-medium">
                        {formatYen(item.actualPrice)}
                      </p>
                    )}
                    {item.netProfit !== undefined && (
                      <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${item.netProfit >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'}`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>利益 {formatYen(item.netProfit)}</span>
                      </div>
                    )}
                    {item.actualPrice === undefined && item.estimatedPrice !== undefined && (
                      <p className="text-primary-600 dark:text-primary-400 font-medium">
                        {formatYen(item.estimatedPrice)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingItem(item);
                  }}
                  className="absolute bottom-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {selectedItem?.imageUrl && (
        <Suspense fallback={null}>
          <AIAnalysisModal
            imageUrl={selectedItem.imageUrl}
            isOpen={true}
            onClose={() => setSelectedItem(null)}
            initialMessages={selectedItem.aiAnalysis}
            onMessagesChange={(msgs) => onUpdateItem(selectedItem.id, { aiAnalysis: msgs })}
            userId={userId}
          />
        </Suspense>
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          categories={categories}
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSave={onUpdateItem}
          onDelete={onDeleteItem}
        />
      )}
    </div>
  );
}
