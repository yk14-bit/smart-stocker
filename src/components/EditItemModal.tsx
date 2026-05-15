import { useState } from 'react';
import { X, Save, Camera, Trash2 } from 'lucide-react';
import type { InventoryItem, Category } from '../types';

interface Props {
  item: InventoryItem;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
}

export function EditItemModal({ item, categories, isOpen, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [estimatedPrice, setEstimatedPrice] = useState(item.estimatedPrice?.toString() || '');
  const [quantity, setQuantity] = useState(item.quantity?.toString() || '1');
  const [imageUrl, setImageUrl] = useState<string | undefined>(item.imageUrl);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, {
      name,
      categoryId,
      imageUrl,
      quantity: parseInt(quantity, 10) || 1,
      estimatedPrice: estimatedPrice ? parseInt(estimatedPrice, 10) : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('本当にこのアイテムを削除しますか？')) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">アイテムの編集</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col items-center justify-center w-full mb-4">
            {imageUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(undefined)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-primary-400 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">写真を変更</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品名</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">カテゴリ</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">在庫数</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">推定販売相場 (¥)</label>
              <input
                type="number"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 active:bg-red-200 transition-colors flex items-center justify-center flex-shrink-0"
              title="このアイテムを削除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <Save className="w-5 h-5" />
              <span>保存する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
