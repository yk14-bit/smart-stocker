import { Activity, Clock, Edit3, PackagePlus, Trash2 } from 'lucide-react';
import type { ItemLog } from '../types';
import { useLogs } from '../hooks/useLogs';

interface Props {
  userId: string;
}

function formatLogTime(createdAt: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

function getLogIcon(actionType: ItemLog['actionType']) {
  if (actionType === 'CREATE') return PackagePlus;
  if (actionType === 'DELETE') return Trash2;
  return Edit3;
}

function getLogTone(actionType: ItemLog['actionType']) {
  if (actionType === 'CREATE') {
    return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300';
  }

  if (actionType === 'DELETE') {
    return 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300';
  }

  return 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300';
}

export function HistoryPanel({ userId }: Props) {
  const { logs, loading, loadingMore, hasMore, loadMore } = useLogs(userId);

  return (
    <section className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">変更履歴</h2>
        </div>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">50件ずつ表示</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <Clock className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">まだ変更履歴はありません</p>
        </div>
      ) : (
        <>
          <ol className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((log) => {
              const Icon = getLogIcon(log.actionType);
              return (
                <li key={log.id} className="px-4 py-4">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getLogTone(log.actionType)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatLogTime(log.createdAt)}
                        </p>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                          {log.actionType}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white break-words">
                        {log.itemName}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300 break-words">
                        {log.details}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {hasMore && (
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loadingMore ? '読み込み中...' : 'もっと見る'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
