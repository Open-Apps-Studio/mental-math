export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'mixed' | 'squares' | 'percent';
export type RoundKind = 'timed' | 'unlimited';
export type Difficulty = 'warmup' | 'standard' | 'hard';

export type PracticeMode = {
  id: Operation;
  title: string;
  subtitle: string;
  symbol: string;
  accent: 'blue' | 'green' | 'purple' | 'orange';
  difficulty: Difficulty;
};

export type Question = {
  prompt: string;
  answer: number;
  displayAnswer: string;
  mode: Operation;
};

export const PRACTICE_MODES: PracticeMode[] = [
  {
    id: 'mixed',
    title: 'Fast Mix',
    subtitle: 'Addition, subtraction, multiplication, and division in one sprint.',
    symbol: '±',
    accent: 'blue',
    difficulty: 'standard',
  },
  {
    id: 'add',
    title: 'Addition',
    subtitle: 'Build quick grouping and carry confidence.',
    symbol: '+',
    accent: 'green',
    difficulty: 'warmup',
  },
  {
    id: 'subtract',
    title: 'Subtraction',
    subtitle: 'Practice complements, borrowing, and distance between numbers.',
    symbol: '-',
    accent: 'orange',
    difficulty: 'warmup',
  },
  {
    id: 'multiply',
    title: 'Multiplication',
    subtitle: 'Times tables, two-digit products, and pattern fluency.',
    symbol: 'x',
    accent: 'purple',
    difficulty: 'standard',
  },
  {
    id: 'divide',
    title: 'Division',
    subtitle: 'Clean integer quotients with a little pressure.',
    symbol: '÷',
    accent: 'blue',
    difficulty: 'standard',
  },
  {
    id: 'squares',
    title: 'Squares',
    subtitle: 'Memorize common squares and snap to answers faster.',
    symbol: 'n²',
    accent: 'green',
    difficulty: 'hard',
  },
  {
    id: 'percent',
    title: 'Percent',
    subtitle: 'Useful everyday percentage drills with tidy values.',
    symbol: '%',
    accent: 'orange',
    difficulty: 'hard',
  },
];

const ranges: Record<Difficulty, { small: number; large: number; multiplier: number }> = {
  warmup: { small: 12, large: 40, multiplier: 9 },
  standard: { small: 20, large: 99, multiplier: 12 },
  hard: { small: 30, large: 180, multiplier: 24 },
};

export function getPracticeMode(id: string | undefined): PracticeMode {
  return PRACTICE_MODES.find((mode) => mode.id === id) ?? PRACTICE_MODES[0];
}

export function generateQuestion(modeId: Operation, difficulty: Difficulty): Question {
  const mode = modeId === 'mixed' ? randomChoice<Operation>(['add', 'subtract', 'multiply', 'divide']) : modeId;
  const range = ranges[difficulty];

  if (mode === 'add') {
    const a = randomInt(range.small, range.large);
    const b = randomInt(range.small, range.large);
    return makeQuestion(`${a} + ${b}`, a + b, mode);
  }

  if (mode === 'subtract') {
    const a = randomInt(range.small, range.large + 40);
    const b = randomInt(2, Math.min(a - 1, range.large));
    return makeQuestion(`${a} - ${b}`, a - b, mode);
  }

  if (mode === 'multiply') {
    const a = randomInt(2, range.multiplier);
    const b = randomInt(2, range.multiplier);
    return makeQuestion(`${a} x ${b}`, a * b, mode);
  }

  if (mode === 'divide') {
    const divisor = randomInt(2, range.multiplier);
    const answer = randomInt(2, range.multiplier);
    return makeQuestion(`${divisor * answer} ÷ ${divisor}`, answer, mode);
  }

  if (mode === 'squares') {
    const n = randomInt(4, range.multiplier);
    return makeQuestion(`${n}²`, n * n, mode);
  }

  const percent = randomChoice([5, 10, 12.5, 20, 25, 50, 75]);
  const base = randomChoice([40, 60, 80, 100, 120, 160, 200, 240, 300]);
  return makeQuestion(`${percent}% of ${base}`, (percent / 100) * base, mode);
}

export function isCorrect(input: string, answer: number): boolean {
  if (!input.trim()) return false;
  const normalized = Number(input);
  if (!Number.isFinite(normalized)) return false;
  return Math.abs(normalized - answer) < 0.001;
}

export function formatSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function makeQuestion(prompt: string, answer: number, mode: Operation): Question {
  return {
    prompt,
    answer,
    displayAnswer: Number.isInteger(answer) ? `${answer}` : `${Number(answer.toFixed(2))}`,
    mode,
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
