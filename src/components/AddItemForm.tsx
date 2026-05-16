import { useMemo, useRef, useState } from 'react';
import { Camera, Sparkles, Upload, X } from 'lucide-react';
import type { Category, InventoryItem } from '../types';
import { AIAnalysisModal } from './AIAnalysisModal';

interface Props {
  categories: Category[];
  onAdd: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  userId: string;
}

function parseOptionalNumber(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function calculateProfit(actualPrice: number, purchasePrice = 0, shippingFee = 0) {
  const sellingFee = Math.floor(actualPrice * 0.1);
  return {
    sellingFee,
    netProfit: actualPrice - purchasePrice - shippingFee - sellingFee,
  };
}

export function AddItemForm({ categories, onAdd, onCancel, userId }: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [shippingFee, setShippingFee] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ role: 'ai' | 'user', text: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const profitPreview = useMemo(() => {
    const sellingPrice = parseOptionalNumber(actualPrice) ?? 0;
    return calculateProfit(
      sellingPrice,
      parseOptionalNumber(purchasePrice) ?? 0,
      parseOptionalNumber(shippingFee) ?? 0
    );
  }, [actualPrice, purchasePrice, shippingFee]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setShowAIModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQuantity = Number(quantity);
    const parsedActualPrice = parseOptionalNumber(actualPrice);
    const parsedPurchasePrice = parseOptionalNumber(purchasePrice);
    const parsedShippingFee = parseOptionalNumber(shippingFee);
    const netProfit = parsedActualPrice !== undefined
      ? calculateProfit(parsedActualPrice, parsedPurchasePrice ?? 0, parsedShippingFee ?? 0).netProfit
      : undefined;

    onAdd({
      name,
      categoryId,
      imageUrl,
      status: parsedQuantity === 0 ? '在庫なし' : '在庫あり',
      quantity: parsedQuantity,
      estimatedPrice: parseOptionalNumber(estimatedPrice),
      actualPrice: parsedActualPrice,
      purchasePrice: parsedPurchasePrice,
      shippingFee: parsedShippingFee,
      netProfit,
      aiAnalysis: aiAnalysis.length > 0 ? aiAnalysis : undefined,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">新規アイテム登録</h2>
          <button type="button" onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center w-full">
            {imageUrl ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setShowAIModal(true)}
                  className="absolute bottom-2 right-2 bg-primary-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 backdrop-blur-sm flex items-center space-x-1 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI査定</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl(undefined);
                    setAiAnalysis([]);
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-primary-400 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-medium">タップして商品写真を撮影</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">またはファイルを選択</p>
                </div>
                <input
                  ref={fileInputRef}
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
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">カテゴリ</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">在庫数</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">相場メモ（円）</label>
              <input
                type="number"
                min="0"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="例: 15000"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">利益シミュレーター</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">販売予定価格</label>
                <input
                  type="number"
                  min="0"
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="売値"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">仕入原価</label>
                <input
                  type="number"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="原価"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">送料見込み</label>
                <input
                  type="number"
                  min="0"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="送料"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">販売手数料 10%</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">¥{profitPreview.sellingFee.toLocaleString()}</p>
              </div>
              <div className={`rounded-xl border px-4 py-3 ${profitPreview.netProfit >= 0 ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40' : 'bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/40'}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">純利益見込み</p>
                <p className={`text-lg font-semibold ${profitPreview.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                  ¥{profitPreview.netProfit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-primary-600 text-white font-medium py-3 px-4 rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <Upload className="w-5 h-5" />
            <span>登録する</span>
          </button>
        </div>
      </form>

      {imageUrl && (
        <AIAnalysisModal
          imageUrl={imageUrl}
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          initialMessages={aiAnalysis}
          onMessagesChange={setAiAnalysis}
          userId={userId}
        />
      )}
    </>
  );
}
