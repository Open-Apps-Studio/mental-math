import AsyncStorage from '@react-native-async-storage/async-storage';
import { Operation, RoundKind } from '@/lib/math';

export type RoundResult = {
  id: string;
  mode: Operation;
  kind: RoundKind;
  correct: number;
  attempted: number;
  elapsedSeconds: number;
  createdAt: string;
};

export type ModeBest = {
  correct: number;
  accuracy: number;
  elapsedSeconds: number;
  createdAt: string;
};

export type MathStats = {
  rounds: RoundResult[];
  bestByMode: Partial<Record<Operation, ModeBest>>;
  totalCorrect: number;
  totalAttempted: number;
  streakDays: number;
  lastPracticeDate: string | null;
};

const STORAGE_KEY = 'rapid_math_stats_v1';

export const emptyStats: MathStats = {
  rounds: [],
  bestByMode: {},
  totalCorrect: 0,
  totalAttempted: 0,
  streakDays: 0,
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
  const rounds = [result, ...current.rounds].slice(0, 150);
  const totalCorrect = current.totalCorrect + result.correct;
  const totalAttempted = current.totalAttempted + result.attempted;
  const bestByMode = { ...current.bestByMode };
  const currentBest = bestByMode[result.mode];
  const accuracy = result.attempted === 0 ? 0 : result.correct / result.attempted;

  if (!currentBest || result.correct > currentBest.correct || (result.correct === currentBest.correct && accuracy > currentBest.accuracy)) {
    bestByMode[result.mode] = {
      correct: result.correct,
      accuracy,
      elapsedSeconds: result.elapsedSeconds,
      createdAt: result.createdAt,
    };
  }

  const today = dateKey(new Date(result.createdAt));
  const streakDays = nextStreak(current.lastPracticeDate, today, current.streakDays);
  const next: MathStats = {
    rounds,
    bestByMode,
    totalCorrect,
    totalAttempted,
    streakDays,
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

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function nextStreak(previous: string | null, today: string, current: number): number {
  if (!previous) return 1;
  if (previous === today) return Math.max(1, current);

  const prevDate = new Date(`${previous}T00:00:00.000Z`);
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / 86_400_000);
  return diffDays === 1 ? current + 1 : 1;
}
