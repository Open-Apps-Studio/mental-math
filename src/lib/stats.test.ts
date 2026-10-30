import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  accuracy,
  currentStreakDays,
  getStats,
  hydrateStats,
  lastSevenDays,
  resetStats,
  RoundResult,
  saveRound,
} from '@/lib/stats';

const STORAGE_KEY = 'rapid_math_stats_v2';

const round = (overrides: Partial<RoundResult> = {}): RoundResult => ({
  id: `${Math.random()}`,
  title: 'Test',
  key: 'test-60',
  kind: 'timed',
  correct: 10,
  attempted: 12,
  elapsedSeconds: 60,
  createdAt: new Date(2026, 5, 15, 12).toISOString(),
  ...overrides,
});

const stored = async () => JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? 'null');

beforeEach(async () => {
  await resetStats();
  await AsyncStorage.clear();
  await hydrateStats();
});

describe('saveRound', () => {
  it('adds up totals, so accuracy reflects skipped questions', async () => {
    await saveRound(round({ correct: 9, attempted: 10 }));
    await saveRound(round({ correct: 6, attempted: 10 }));
    const stats = getStats();
    expect(stats.totalCorrect).toBe(15);
    expect(stats.totalAttempted).toBe(20);
    expect(accuracy(stats.totalCorrect, stats.totalAttempted)).toBe(75);
  });

  it('keeps the best score per key and overall', async () => {
    await saveRound(round({ key: 'a', correct: 5 }));
    await saveRound(round({ key: 'a', correct: 9 }));
    await saveRound(round({ key: 'a', correct: 7 }));
    await saveRound(round({ key: 'b', correct: 3 }));
    const stats = getStats();
    expect(stats.bestByKey.a.correct).toBe(9);
    expect(stats.bestByKey.b.correct).toBe(3);
    expect(stats.bestRun).toBe(9);
  });

  it('never reports fewer attempts than correct answers', async () => {
    await saveRound(round({ correct: 10, attempted: 2 }));
    expect(getStats().rounds[0].attempted).toBe(10);
  });

  it('persists to storage', async () => {
    await saveRound(round({ correct: 4 }));
    expect((await stored()).totalCorrect).toBe(4);
  });
});

describe('hydrateStats races', () => {
  // AppState 'active' fires both the root layout's hydrate and the session's
  // finishRound when a timed round expired in the background.
  it('does not let a slow read undo a round saved meanwhile', async () => {
    const stale = JSON.stringify({ totalCorrect: 1 });
    await AsyncStorage.setItem(STORAGE_KEY, stale);
    await hydrateStats();

    let finishRead: (value: string) => void = () => {};
    jest.mocked(AsyncStorage.getItem).mockImplementationOnce(
      () => new Promise<string>((resolve) => (finishRead = resolve)),
    );
    const hydrating = hydrateStats();
    await Promise.resolve();
    await saveRound(round({ correct: 5 }));
    finishRead(stale);
    await hydrating;

    expect(getStats().totalCorrect).toBe(6);
    await saveRound(round({ correct: 1 }));
    expect((await stored()).totalCorrect).toBe(7);
  });

  it('waits for an in-flight write before reading', async () => {
    await saveRound(round({ correct: 1 }));

    const write = jest.mocked(AsyncStorage.setItem).getMockImplementation()!;
    let finishWrite: () => void = () => {};
    jest.mocked(AsyncStorage.setItem).mockImplementationOnce(
      (key, value) =>
        new Promise<void>((resolve) => {
          finishWrite = () => void write(key, value).then(resolve);
        }),
    );

    const saving = saveRound(round({ correct: 8 }));
    const hydrating = hydrateStats();
    await new Promise((resolve) => setTimeout(resolve, 0));
    finishWrite();
    await Promise.all([saving, hydrating]);

    expect(getStats().totalCorrect).toBe(9);
  });

  it('does not resurrect stats wiped during a read', async () => {
    await saveRound(round({ correct: 5 }));
    let finishRead: (value: string | null) => void = () => {};
    const snapshot = await AsyncStorage.getItem(STORAGE_KEY);
    jest.mocked(AsyncStorage.getItem).mockImplementationOnce(
      () => new Promise<string | null>((resolve) => (finishRead = resolve)),
    );
    const hydrating = hydrateStats();
    await Promise.resolve();
    await resetStats();
    finishRead(snapshot);
    await hydrating;

    expect(getStats().totalCorrect).toBe(0);
  });
});

describe('streaks', () => {
  const day = (d: number) => new Date(2026, 5, d, 12).toISOString();

  it('grows on consecutive days and restarts after a gap', async () => {
    await saveRound(round({ createdAt: day(1) }));
    await saveRound(round({ createdAt: day(1) }));
    expect(getStats().streakDays).toBe(1);
    await saveRound(round({ createdAt: day(2) }));
    await saveRound(round({ createdAt: day(3) }));
    expect(getStats().streakDays).toBe(3);
    await saveRound(round({ createdAt: day(6) }));
    expect(getStats().streakDays).toBe(1);
    expect(getStats().longestStreak).toBe(3);
  });

  it('treats a streak as alive until a full day is missed', () => {
    const now = new Date(2026, 5, 10, 8);
    expect(currentStreakDays('2026-06-10', 4, now)).toBe(4);
    expect(currentStreakDays('2026-06-09', 4, now)).toBe(4);
    expect(currentStreakDays('2026-06-08', 4, now)).toBe(0);
    expect(currentStreakDays(null, 4, now)).toBe(0);
  });
});

describe('lastSevenDays', () => {
  it('sums solved questions per local day, ending today', async () => {
    const now = new Date(2026, 5, 15, 12);
    await saveRound(round({ correct: 3, createdAt: new Date(2026, 5, 15, 9).toISOString() }));
    await saveRound(round({ correct: 4, createdAt: new Date(2026, 5, 15, 10).toISOString() }));
    await saveRound(round({ correct: 2, createdAt: new Date(2026, 5, 14, 23).toISOString() }));
    const week = lastSevenDays(getStats(), now.getTime());
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ solved: 7, isToday: true });
    expect(week[5].solved).toBe(2);
    expect(week[0].solved).toBe(0);
  });
});
