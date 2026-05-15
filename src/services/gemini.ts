import { GoogleGenAI } from '@google/genai';

// Convert base64 data URL to the format required by the GenAI SDK
function dataUrlToPart(dataUrl: string) {
  // data:image/png;base64,iVBORw0KGgo...
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }
  return {
    inlineData: {
      data: match[2],
      mimeType: match[1]
    }
  };
}

export async function analyzeImage(apiKey: string, modelName: string, base64Image: string, customPrompt?: string) {
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。設定画面からGemini APIキーを登録してください。');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const defaultPrompt = `
画像の製品がどういうものか分析してください。
以下の情報をセットで提供してください：
1. 【商品名・ブランド】: 商品の具体的な名前やブランド（推測できる場合）
2. 【カテゴリ】: 建材、ファッション、ホビーなどの分類
3. 【推定相場】: フリマアプリでの一般的な販売価格の相場（例: ¥5,000〜¥8,000）
4. 【フリマ出品用説明文】: そのままメルカリ等で使える、商品の魅力を伝える説明文のテンプレート
`;

  const prompt = customPrompt 
    ? `${defaultPrompt}\n\nユーザーからの補足情報・追加指示：\n${customPrompt}` 
    : defaultPrompt;

  try {
    const imagePart = dataUrlToPart(base64Image);
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        prompt,
        imagePart,
      ],
    });

    return response.text;
  } catch (error: any) {
    // 開発者向けの詳細なエラーログ出力
    console.group('Gemini API Error Details');
    console.error('Error Object:', error);
    if (error?.status) console.error('Status Code:', error.status);
    if (error?.message) console.error('Message:', error.message);
    if (error?.response) console.error('API Response:', error.response);
    console.groupEnd();

    // ユーザー向けのエラーメッセージ
    throw new Error(`画像の分析中にエラーが発生しました（詳細: ${error?.message || '不明なエラー'}）。ブラウザのコンソールログを確認してください。`);
  }
}
