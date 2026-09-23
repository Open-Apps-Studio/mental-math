import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoundKind } from '@/lib/math';

export type RoundResult = {
  id: string;
  /** Human label of what was practised, e.g. "Natural · Addition". */
  title: string;
  /** Stable key for best-score grouping (usually the domain id). */
  key: string;
  kind: RoundKind;
  correct: number;
  attempted: number;
  elapsedSeconds: number;
  createdAt: string;
};

export type Best = {
  correct: number;
  accuracy: number;
  createdAt: string;
};

export type MathStats = {
  rounds: RoundResult[];
  bestByKey: Record<string, Best>;
  bestRun: number;
  totalCorrect: number;
  totalAttempted: number;
  streakDays: number;
  longestStreak: number;
  lastPracticeDate: string | null;
};

const STORAGE_KEY = 'rapid_math_stats_v2';

export const emptyStats: MathStats = {
  rounds: [],
  bestByKey: {},
  bestRun: 0,
  totalCorrect: 0,
  totalAttempted: 0,
  streakDays: 0,
  longestStreak: 0,
  lastPracticeDate: null,
};

let state: MathStats = emptyStats;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeStats(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStats(): MathStats {
  return state;
}

export function currentStreakDays(lastPracticeDate: string | null, streakDays: number, now = new Date()): number {
  if (!lastPracticeDate || streakDays === 0) return 0;
  const today = dateKey(now);
  if (lastPracticeDate === today) return streakDays;
  const prevDate = new Date(`${lastPracticeDate}T00:00:00.000Z`);
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / 86_400_000);
  return diffDays === 1 ? streakDays : 0;
}

export async function hydrateStats(): Promise<MathStats> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const activeStreak = currentStreakDays(parsed.lastPracticeDate, parsed.streakDays ?? 0);
        state = {
          ...emptyStats,
          ...parsed,
          rounds: Array.isArray(parsed.rounds) ? parsed.rounds : [],
          bestByKey: parsed.bestByKey && typeof parsed.bestByKey === 'object' ? parsed.bestByKey : {},
          streakDays: activeStreak,
          longestStreak: Math.max(parsed.longestStreak ?? 0, parsed.streakDays ?? 0, activeStreak),
        };
      }
    } else if (!hydrated) {
      state = emptyStats;
    }
  } catch {
    if (!hydrated) {
      state = emptyStats;
    }
  }
  hydrated = true;
  emit();
  return state;
}

export async function loadStats(): Promise<MathStats> {
  if (!hydrated) {
    return hydrateStats();
  }
  return state;
}

export async function saveRound(result: RoundResult): Promise<MathStats> {
  if (!hydrated) {
    await hydrateStats();
  }
  const current = state;
  const safeCorrect = Number.isFinite(result.correct) ? Math.max(0, result.correct) : 0;
  const safeAttempted = Number.isFinite(result.attempted) ? Math.max(safeCorrect, result.attempted) : safeCorrect;
  const safeResult: RoundResult = { ...result, correct: safeCorrect, attempted: safeAttempted };

  const rounds = [safeResult, ...current.rounds].slice(0, 200);
  const totalCorrect = current.totalCorrect + safeResult.correct;
  const totalAttempted = current.totalAttempted + safeResult.attempted;
  const acc = safeResult.attempted === 0 ? 0 : safeResult.correct / safeResult.attempted;

  const bestByKey = { ...current.bestByKey };
  const prev = bestByKey[safeResult.key];
  if (!prev || safeResult.correct > prev.correct || (safeResult.correct === prev.correct && acc > prev.accuracy)) {
    bestByKey[safeResult.key] = { correct: safeResult.correct, accuracy: acc, createdAt: safeResult.createdAt };
  }

  const today = dateKey(new Date(safeResult.createdAt));
  const activeStreak = currentStreakDays(current.lastPracticeDate, current.streakDays, new Date(safeResult.createdAt));
  const streakDays = nextStreak(current.lastPracticeDate, today, activeStreak);
  const next: MathStats = {
    rounds,
    bestByKey,
    bestRun: Math.max(current.bestRun, safeResult.correct),
    totalCorrect,
    totalAttempted,
    streakDays,
    longestStreak: Math.max(current.longestStreak ?? 0, current.streakDays, streakDays),
    lastPracticeDate: today,
  };

  state = next;
  emit();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('Failed to persist stats:', err);
  }
  return next;
}

export async function resetStats(): Promise<void> {
  state = emptyStats;
  emit();
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to remove stats:', err);
  }
}

export function accuracy(correct: number, attempted: number): number {
  return attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
}

/** Local-calendar day key (YYYY-MM-DD) so late-night practice counts toward the user's own day. */
function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type DayActivity = {
  /** Two-letter weekday label, e.g. "Mo". */
  weekday: string;
  solved: number;
  isToday: boolean;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

/** Rolling 7-day window ending today, built from the retained round history. */
export function lastSevenDays(stats: MathStats, now = Date.now()): DayActivity[] {
  const byDay = new Map<string, number>();
  for (const round of stats.rounds) {
    const key = dateKey(new Date(round.createdAt));
    byDay.set(key, (byDay.get(key) ?? 0) + round.correct);
  }
  const out: DayActivity[] = [];
  const base = new Date(now);
  for (let i = 6; i >= 0; i--) {
    const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
    out.push({
      weekday: WEEKDAYS[date.getDay()],
      solved: byDay.get(dateKey(date)) ?? 0,
      isToday: i === 0,
    });
  }
  return out;
}

function nextStreak(previous: string | null, today: string, current: number): number {
  if (!previous) return 1;
  if (previous === today) return Math.max(1, current);
  const prevDate = new Date(`${previous}T00:00:00.000Z`);
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / 86_400_000);
  return diffDays === 1 ? current + 1 : 1;
}
