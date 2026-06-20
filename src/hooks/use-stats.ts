import { useCallback, useEffect, useState } from 'react';
import { emptyStats, loadStats, MathStats, resetStats, RoundResult, saveRound } from '@/lib/stats';

export function useStats() {
  const [stats, setStats] = useState<MathStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setStats(await loadStats());
    setIsLoading(false);
  }, []);

  const recordRound = useCallback(async (result: RoundResult) => {
    setStats(await saveRound(result));
  }, []);

  const clear = useCallback(async () => {
    await resetStats();
    setStats(emptyStats);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, isLoading, refresh, recordRound, clear };
}
