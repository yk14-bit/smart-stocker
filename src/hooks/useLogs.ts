import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { ItemLog } from '../types';

export function useLogs(userId: string | undefined) {
  const [logs, setLogs] = useState<ItemLog[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('item_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50); // Fetch latest 50 logs

        if (error) throw error;

        if (data) {
          setLogs(
            data.map((row) => ({
              id: row.id,
              userId: row.user_id,
              itemId: row.item_id,
              itemName: row.item_name,
              actionType: row.action_type,
              details: row.details,
              createdAt: row.created_at,
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Subscribe to new logs
    const channel = supabase
      .channel('public:item_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'item_logs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newLog = payload.new;
          setLogs((prev) => {
            const mappedLog: ItemLog = {
              id: newLog.id,
              userId: newLog.user_id,
              itemId: newLog.item_id,
              itemName: newLog.item_name,
              actionType: newLog.action_type,
              details: newLog.details,
              createdAt: newLog.created_at,
            };
            return [mappedLog, ...prev].slice(0, 50); // Keep max 50 in memory
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { logs, loading };
}
