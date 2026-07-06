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

export async function loadStats(): Promise<MathStats> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyStats;
  try {
    return { ...emptyStats, ...JSON.parse(raw) };
  } catch {
    return emptyStats;
  }
}

export async function saveRound(result: RoundResult): Promise<MathStats> {
  const current = await loadStats();
  const rounds = [result, ...current.rounds].slice(0, 200);
  const totalCorrect = current.totalCorrect + result.correct;
  const totalAttempted = current.totalAttempted + result.attempted;
  const acc = result.attempted === 0 ? 0 : result.correct / result.attempted;

  const bestByKey = { ...current.bestByKey };
  const prev = bestByKey[result.key];
  if (!prev || result.correct > prev.correct || (result.correct === prev.correct && acc > prev.accuracy)) {
    bestByKey[result.key] = { correct: result.correct, accuracy: acc, createdAt: result.createdAt };
  }

  const today = dateKey(new Date(result.createdAt));
  const streakDays = nextStreak(current.lastPracticeDate, today, current.streakDays);
  const next: MathStats = {
    rounds,
    bestByKey,
    bestRun: Math.max(current.bestRun, result.correct),
    totalCorrect,
    totalAttempted,
    streakDays,
    longestStreak: Math.max(current.longestStreak ?? 0, current.streakDays, streakDays),
    lastPracticeDate: today,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function resetStats(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
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
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 86_400_000);
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
