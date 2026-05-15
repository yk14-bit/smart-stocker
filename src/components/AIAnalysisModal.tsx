import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Send } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { useSettings } from '../hooks/useSettings';

interface Props {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  autoAnalyze?: boolean;
  initialMessages?: { role: 'ai' | 'user', text: string }[];
  onMessagesChange?: (messages: { role: 'ai' | 'user', text: string }[]) => void;
}

export function AIAnalysisModal({ imageUrl, isOpen, onClose, autoAnalyze = false, initialMessages = [], onMessagesChange }: Props) {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [contextInput, setContextInput] = useState('');

  // Sync messages upwards
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  const runAnalysis = async (customPrompt?: string, initialContext?: string) => {
    if (!settings.geminiApiKey) {
      setError('設定画面からGemini APIキーを登録してください。');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Custom prompt is used for follow-up chat messages
    if (customPrompt) {
      setMessages(prev => [...prev, { role: 'user', text: customPrompt }]);
    }

    // Combine initialContext if provided for the first analysis
    let finalPrompt = customPrompt;
    if (!customPrompt && initialContext) {
      finalPrompt = `補足情報: ${initialContext}\n\n上記の補足情報を踏まえて、画像の製品を分析してください。`;
    }

    try {
      const result = await analyzeImage(settings.geminiApiKey, settings.geminiModel || 'gemini-2.5-flash', imageUrl, finalPrompt);
      setMessages(prev => [...prev, { role: 'ai', text: result || '' }]);
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Only reset messages if initialMessages wasn't provided, or just sync it
      setMessages(initialMessages);
      setError('');
      setContextInput('');
      if (autoAnalyze && initialMessages.length === 0) {
        runAnalysis();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoAnalyze]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold text-gray-900 dark:text-white">AI 画像分析</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center mb-6">
            <img src={imageUrl} alt="Analysis Target" className="max-h-48 rounded-xl object-contain shadow-sm border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black" />
          </div>

          {!autoAnalyze && messages.length === 0 && !isLoading && !error && (
            <div className="max-w-md mx-auto py-4 space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-center font-medium">
                画像の分析を開始します。製品名やブランド、状態など補足情報があれば入力してください。
              </p>
              
              <textarea
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                placeholder="例: EMTEKのドアノブ、未使用品です。相場と説明文を教えて。"
                rows={3}
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
              />

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => runAnalysis(undefined, contextInput)}
                  className="bg-primary-600 text-white font-medium py-3 px-8 rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors inline-flex items-center space-x-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI分析を開始</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border border-transparent ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.text}</pre>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 dark:border-gray-700 border border-transparent rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                  <Loader2 className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">AIが分析中...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        {messages.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (promptInput.trim() && !isLoading) {
                  runAnalysis(promptInput);
                  setPromptInput('');
                }
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="AIに追加の質問や指示を入力..."
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !promptInput.trim()}
                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
