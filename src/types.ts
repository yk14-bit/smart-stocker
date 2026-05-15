export type ItemStatus = '在庫あり' | '在庫なし' | '出品中' | '販売済';

export interface Category {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  imageUrl?: string;
  name: string;
  categoryId: string;
  status: ItemStatus;
  estimatedPrice?: number;
  actualPrice?: number;
  description?: string;
  createdAt: number;
  aiAnalysis?: { role: 'ai' | 'user'; text: string }[];
  quantity?: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'ファッション' },
  { id: '2', name: '家具・インテリア' },
  { id: '3', name: 'DIY・工具' },
  { id: '4', name: '建材・金物類' },
  { id: '5', name: 'ベビー・キッズ' },
  { id: '6', name: 'ゲーム・おもちゃ・グッズ' },
  { id: '7', name: 'ホビー・楽器・アート' },
  { id: '8', name: 'CD・DVD・ブルーレイ' },
  { id: '9', name: 'スマホ・タブレット・パソコン' },
  { id: '10', name: 'テレビ・オーディオ・カメラ' },
  { id: '11', name: 'チケット' },
  { id: '12', name: '本・雑誌・漫画' },
  { id: '13', name: '生活家電・空調' },
  { id: '14', name: 'スポーツ' },
  { id: '15', name: 'アウトドア・釣り・旅行用品' },
  { id: '16', name: 'コスメ・美容' },
  { id: '17', name: 'ダイエット・健康' },
  { id: '18', name: '食品・飲料・酒' },
  { id: '19', name: 'キッチン・日用品・その他' },
  { id: '20', name: 'ペット用品' },
  { id: '21', name: 'ハンドメイド・手芸' },
  { id: '22', name: '車・バイク・自転車' },
];
