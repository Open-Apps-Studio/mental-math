import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { getStats, hydrateStats, resetStats, RoundResult, saveRound, subscribeStats } from '@/lib/stats';

export function useStats() {
  const stats = useSyncExternalStore(subscribeStats, getStats);

  const refresh = useCallback(async () => {
    await hydrateStats();
  }, []);

  const recordRound = useCallback(async (result: RoundResult) => {
    await saveRound(result);
  }, []);

  const clear = useCallback(async () => {
    await resetStats();
  }, []);

  useEffect(() => {
    void hydrateStats();
  }, []);

  return { stats, isLoading: false, refresh, recordRound, clear };
}
