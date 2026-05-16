import { GoogleGenAI } from '@google/genai';

function dataUrlToPart(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL format');
  }

  return {
    inlineData: {
      data: match[2],
      mimeType: match[1],
    },
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return '不明なエラー';
}

export async function analyzeImage(apiKey: string, modelName: string, base64Image: string, customPrompt?: string) {
  if (!apiKey) {
    throw new Error('Gemini APIキーが設定されていません。設定画面からGemini APIキーを登録してください。');
  }

  const ai = new GoogleGenAI({ apiKey });

  const defaultPrompt = `
あなたはメルカリ・ヤフオク向けの中古物販の商品ページ作成担当です。
添付画像の商品について分析し、以下を出力してください。

1. 商品名候補3つ
2. 検索されやすいキーワード
3. 状態の説明
4. サイズ・素材・型番など確認すべき追加情報
5. メルカリ向け説明文（送料込みを想定）
6. ヤフオク向け説明文
7. 想定購入者
8. 高く売るために追加で撮るべき写真
9. 注意書き・免責文

商品は住宅金物・輸入建材、ブランド小物、工具、DIY用品などを想定してください。
注文住宅、リノベーション、店舗内装、DIYの購入者に刺さる表現にしてください。
デザインの雰囲気、施工イメージ、合わせやすい内装テイストを盛り込みつつ、適合可否や施工保証は断定せず、サイズ確認を促す文章にしてください。
誇張表現、真贋未確認の断定、安全性の断定、医薬品的・法令違反につながる表現は避けてください。
`;

  const prompt = customPrompt
    ? `${defaultPrompt}\n\nユーザーからの補足情報・追加指示:\n${customPrompt}`
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
  } catch (error) {
    console.group('Gemini API Error Details');
    console.error('Error Object:', error);
    console.groupEnd();

    throw new Error(`画像のAI査定中にエラーが発生しました。詳細: ${getErrorMessage(error)}`, { cause: error });
  }
}
