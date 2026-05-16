import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { ItemLog } from '../types';

const PAGE_SIZE = 50;

interface SupabaseLogRow {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  action_type: ItemLog['actionType'];
  details: string;
  created_at: string;
}

function mapLogRow(row: SupabaseLogRow): ItemLog {
  return {
    id: row.id,
    userId: row.user_id,
    itemId: row.item_id,
    itemName: row.item_name,
    actionType: row.action_type,
    details: row.details,
    createdAt: row.created_at,
  };
}

export function useLogs(userId: string | undefined) {
  const [logs, setLogs] = useState<ItemLog[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(async (from: number) => {
    if (!userId) return;

    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('item_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const nextLogs = ((data || []) as SupabaseLogRow[]).map(mapLogRow);
    setHasMore(nextLogs.length === PAGE_SIZE);
    setLogs((prev) => {
      if (from === 0) return nextLogs;
      const existingIds = new Set(prev.map((log) => log.id));
      return [...prev, ...nextLogs.filter((log) => !existingIds.has(log.id))];
    });
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      await fetchPage(logs.length);
    } catch (err) {
      console.error('Error loading more logs:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, logs.length, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let active = true;

    queueMicrotask(() => {
      if (active) setLoading(true);
    });
    queueMicrotask(() => {
      fetchPage(0)
        .catch((err) => {
          if (active) console.error('Error fetching logs:', err);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    });

    const channel = supabase
      .channel(`item_logs:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'item_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const mappedLog = mapLogRow(payload.new as SupabaseLogRow);
          setLogs((prev) => {
            if (prev.some((log) => log.id === mappedLog.id)) return prev;
            return [mappedLog, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [fetchPage, userId]);

  return { logs, loading, loadingMore, hasMore, loadMore };
}
