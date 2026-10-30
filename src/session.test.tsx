import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler, Platform } from 'react-native';
import SessionScreen from '../app/session';
import { generateQuestion, Question } from '@/lib/math';
import { getStats, resetStats, saveRound } from '@/lib/stats';
import { SessionConfig, startSession } from '@/lib/trainer-store';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
    // Render the header controls inline so tests can press them.
    Stack: {
      Screen: ({ options }: { options?: { headerLeft?: () => unknown; headerRight?: () => unknown } }) =>
        React.createElement(React.Fragment, null, options?.headerLeft?.(), options?.headerRight?.()),
    },
  };
});
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-haptics', () => ({
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
  notificationAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/lib/math', () => ({
  ...jest.requireActual('@/lib/math'),
  generateQuestion: jest.fn(),
}));

const config = (overrides: Partial<SessionConfig> = {}): SessionConfig => ({
  title: 'Test round',
  statKey: 'test-key',
  domain: 'natural',
  exercises: ['add'],
  difficulty: {},
  kind: 'timed',
  seconds: 60,
  ...overrides,
});

const tap = (label: string) => fireEvent.press(screen.getByLabelText(label));

async function answer(value: number) {
  for (const digit of `${value}`) await tap(digit);
}

const passTime = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

let count = 0;

beforeEach(async () => {
  // With faked microtasks, React can clear the round's interval in the middle of
  // a fake-timers tick, and fake-timers then throws.
  jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask'] });
  count = 0;
  // Question n is "n + n", so the prompts on screen are predictable.
  jest.mocked(generateQuestion).mockImplementation((): Question => {
    count += 1;
    return { prompt: `${count} + ${count}`, answer: count * 2, displayAnswer: `${count * 2}`, exercise: 'add', decimal: false };
  });
  await resetStats();
});

afterEach(() => {
  jest.useRealTimers();
});

async function play(overrides?: Partial<SessionConfig>) {
  startSession(config(overrides));
  await render(<SessionScreen />);
}

const seedBest = (correct: number) =>
  saveRound({
    id: 'seed',
    title: 'Test round',
    key: 'test-key',
    kind: 'timed',
    correct,
    attempted: correct,
    elapsedSeconds: 60,
    createdAt: new Date().toISOString(),
  });

describe('answering', () => {
  it('scores a correct answer and moves on without a submit key', async () => {
    await play();
    expect(screen.getByText('1 + 1')).toBeTruthy();
    await answer(2);
    expect(screen.getByText('2 + 2')).toBeTruthy();
    expect(screen.getByLabelText('Solved: 1')).toBeTruthy();
  });

  it('does not score a wrong answer', async () => {
    await play();
    await answer(3);
    expect(screen.getByText('1 + 1')).toBeTruthy();
    expect(screen.getByLabelText('Solved: 0')).toBeTruthy();
  });
});

describe('skipping', () => {
  it('moves on and shows the answer until the next correct one', async () => {
    await play();
    await tap('Skip question');
    expect(screen.getByText('2 + 2')).toBeTruthy();
    expect(screen.getByText('Skipped: 1 + 1 = 2')).toBeTruthy();
    expect(screen.getByLabelText('Solved: 0')).toBeTruthy();

    await answer(4);
    expect(screen.queryByText('Skipped: 1 + 1 = 2')).toBeNull();
  });

  it('clears a half-typed answer', async () => {
    await play();
    await tap('9');
    await tap('Skip question');
    expect(screen.getByText('Type answer')).toBeTruthy();
  });

  it('lowers accuracy and lists skipped questions on the results screen', async () => {
    await play();
    await answer(2);
    await tap('Skip question');
    await answer(6);
    await answer(8);
    await passTime(61_000);

    expect(screen.getByLabelText('Accuracy: 75%')).toBeTruthy();
    expect(screen.getByLabelText('Skipped: 1')).toBeTruthy();
    expect(screen.getByText('2 + 2')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();

    const stats = getStats();
    expect(stats.rounds[0]).toMatchObject({ correct: 3, attempted: 4, key: 'test-key' });
    expect(stats.totalAttempted).toBe(4);
  });
});

describe('finishing', () => {
  it('does not save a round with no attempts', async () => {
    await play();
    await passTime(61_000);
    expect(screen.getByText("Nothing answered, so this round wasn't saved.")).toBeTruthy();
    expect(getStats().rounds).toHaveLength(0);
    expect(getStats().streakDays).toBe(0);
  });

  it('saves a round exactly once', async () => {
    await play();
    await answer(2);
    await passTime(120_000);
    expect(getStats().rounds).toHaveLength(1);
  });

  it('shows a new best when the previous one is beaten', async () => {
    await seedBest(1);
    await play();
    await answer(2);
    await answer(4);
    await passTime(61_000);
    expect(screen.getByText('New best!')).toBeTruthy();
  });

  it('does not show a new best for a tie', async () => {
    await seedBest(1);
    await play();
    await answer(2);
    await passTime(61_000);
    expect(screen.queryByText('New best!')).toBeNull();
  });

  it('does not show a new best on the first score for a test', async () => {
    await play();
    await answer(2);
    await passTime(61_000);
    expect(screen.queryByText('New best!')).toBeNull();
  });

  it('starts clean on Play again', async () => {
    await play();
    await tap('Skip question');
    await passTime(61_000);
    await tap('Play again');
    expect(screen.getByLabelText('Solved: 0')).toBeTruthy();
    expect(screen.getByLabelText('Time: 1:00')).toBeTruthy();
    expect(screen.queryByText(/^Skipped:/)).toBeNull();

    await answer(count * 2);
    await passTime(61_000);
    expect(screen.getByLabelText('Accuracy: 100%')).toBeTruthy();
    expect(screen.queryByText('Review what you skipped')).toBeNull();
    expect(getStats().rounds[0]).toMatchObject({ correct: 1, attempted: 1 });
  });
});

describe('leaving a round', () => {
  it('asks before Android back abandons the round', async () => {
    const original = Platform.OS;
    Platform.OS = 'android';
    const listen = jest.spyOn(BackHandler, 'addEventListener');
    try {
      await play();
      const handler = listen.mock.calls.find(([event]) => event === 'hardwareBackPress')![1];
      let handled = false;
      await act(async () => {
        handled = handler() === true;
      });
      expect(handled).toBe(true);
      expect(screen.getByText('Cancel round?')).toBeTruthy();
    } finally {
      Platform.OS = original;
      listen.mockRestore();
    }
  });

  it('stops the clock while the cancel dialog is open', async () => {
    await play();
    await tap('Cancel round');
    await passTime(120_000);
    await tap('Cancel');
    expect(screen.getByLabelText('Time: 1:00')).toBeTruthy();
    expect(getStats().rounds).toHaveLength(0);
  });
});
