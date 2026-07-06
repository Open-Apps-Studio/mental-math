// Pure exercise generation + answer checking for Mental Math.
//
// An exercise is one operation (Addition, Squares, ...). A number domain
// (Natural, Decimal, Money, Huge, Times tables) controls the magnitude and
// formatting of the operands. Difficulty scales the range within a domain.

export type ExerciseType =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'square'
  | 'sqrt'
  | 'fraction'
  | 'percent'
  | 'modulo';

export type NumberDomain = 'natural' | 'decimal' | 'money' | 'huge' | 'times';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'superhard';
export type RoundKind = 'timed' | 'unlimited';

export type ExerciseDef = {
  id: ExerciseType;
  label: string;
  symbol: string;
};

export type DifficultyDef = {
  id: Difficulty;
  label: string;
  /** 1-4, used by the signal-bar indicator. */
  level: number;
};

export type Question = {
  prompt: string;
  answer: number;
  displayAnswer: string;
  exercise: ExerciseType;
  /** True when a decimal keypad / tolerant comparison is needed. */
  decimal: boolean;
};

export const EXERCISES: ExerciseDef[] = [
  { id: 'add', label: 'Addition', symbol: '+' },
  { id: 'subtract', label: 'Subtraction', symbol: '−' },
  { id: 'multiply', label: 'Multiplication', symbol: '×' },
  { id: 'divide', label: 'Division', symbol: '÷' },
  { id: 'square', label: 'Squares', symbol: 'x²' },
  { id: 'sqrt', label: 'Square roots', symbol: '√x' },
  { id: 'fraction', label: 'Fractions', symbol: '⁄' },
  { id: 'percent', label: 'Percentages', symbol: '%' },
  { id: 'modulo', label: 'Modulo', symbol: 'M' },
];

export const DIFFICULTIES: DifficultyDef[] = [
  { id: 'easy', label: 'Easy', level: 1 },
  { id: 'medium', label: 'Medium', level: 2 },
  { id: 'hard', label: 'Hard', level: 3 },
  { id: 'superhard', label: 'Super hard', level: 4 },
];

export function getExercise(id: string | undefined): ExerciseDef {
  return EXERCISES.find((e) => e.id === id) ?? EXERCISES[0];
}

export function difficultyLevel(id: Difficulty): number {
  return DIFFICULTIES.find((d) => d.id === id)?.level ?? 2;
}

// Operand magnitude per domain + difficulty. [min, max] inclusive.
const RANGES: Record<NumberDomain, Record<Difficulty, [number, number]>> = {
  natural: { easy: [2, 15], medium: [5, 99], hard: [12, 499], superhard: [50, 1999] },
  huge: { easy: [100, 999], medium: [1000, 9999], hard: [5000, 99999], superhard: [10000, 999999] },
  decimal: { easy: [1, 12], medium: [2, 40], hard: [5, 150], superhard: [10, 500] },
  money: { easy: [1, 20], medium: [3, 99], hard: [10, 499], superhard: [25, 1999] },
  times: { easy: [2, 9], medium: [2, 12], hard: [2, 15], superhard: [6, 20] },
};

export function generateQuestion(
  exercise: ExerciseType,
  domain: NumberDomain,
  difficulty: Difficulty,
): Question {
  const [lo, hi] = RANGES[domain][difficulty];
  const money = domain === 'money';
  const decimal = domain === 'decimal' || money;

  switch (exercise) {
    case 'add': {
      const a = operand(domain, lo, hi);
      const b = operand(domain, lo, hi);
      return build(`${fmt(a, domain)} + ${fmt(b, domain)}`, a + b, exercise, domain);
    }
    case 'subtract': {
      let a = operand(domain, lo, hi);
      let b = operand(domain, lo, hi);
      if (b > a) [a, b] = [b, a];
      return build(`${fmt(a, domain)} − ${fmt(b, domain)}`, a - b, exercise, domain);
    }
    case 'multiply': {
      // Keep the second factor small so products stay mental-mathable.
      const a = operand(domain, lo, hi);
      const b = domain === 'times' ? randInt(lo, hi) : randInt(2, decimal ? 9 : Math.min(12, hi));
      return build(`${fmt(a, domain)} × ${b}`, a * b, exercise, domain);
    }
    case 'divide': {
      // Generate from the answer so quotients are clean.
      const divisor = randInt(2, domain === 'times' ? hi : 12);
      const quotient = operand(domain, lo, hi);
      const dividend = round2(divisor * quotient);
      return build(`${fmt(dividend, domain)} ÷ ${divisor}`, quotient, exercise, domain);
    }
    case 'square': {
      const base = Math.max(2, Math.round(Math.sqrt(hi)));
      const n = randInt(Math.max(2, Math.round(Math.sqrt(lo))), base);
      return build(`${n}²`, n * n, 'square', 'natural');
    }
    case 'sqrt': {
      const base = Math.max(2, Math.round(Math.sqrt(hi)));
      const n = randInt(2, base);
      return build(`√${n * n}`, n, 'sqrt', 'natural');
    }
    case 'fraction': {
      // "a/b of N" with an integer answer.
      const denom = pick([2, 3, 4, 5, 6, 8, 10]);
      const numer = randInt(1, denom - 1);
      const multiple = randInt(2, Math.max(3, Math.round(hi / denom)));
      const base = denom * multiple;
      return build(`${numer}/${denom} of ${base}`, (numer * base) / denom, 'fraction', 'natural');
    }
    case 'percent': {
      const percent = pick([5, 10, 15, 20, 25, 40, 50, 75]);
      const base = money ? round2(randInt(lo, hi) + 0.5) : pick([20, 40, 60, 80, 120, 160, 200, 400]);
      const result = round2((percent / 100) * base);
      return build(`${percent}% of ${fmt(base, domain)}`, result, 'percent', domain);
    }
    case 'modulo': {
      const a = randInt(lo, hi);
      const b = randInt(2, 9);
      return build(`${a} mod ${b}`, a % b, 'modulo', 'natural');
    }
  }
}

export function isCorrect(input: string, answer: number): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return false;
  return Math.abs(value - answer) < 0.005;
}

export function formatSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// --- helpers -------------------------------------------------------------

function build(prompt: string, rawAnswer: number, exercise: ExerciseType, domain: NumberDomain): Question {
  const answer = round2(rawAnswer);
  const money = domain === 'money';
  const decimal = domain === 'decimal' || money;
  return {
    prompt,
    answer,
    displayAnswer: fmt(answer, domain),
    exercise,
    decimal: decimal && !Number.isInteger(answer),
  };
}

/** Pick an operand respecting the domain's number shape. */
function operand(domain: NumberDomain, lo: number, hi: number): number {
  if (domain === 'decimal') return round2(randInt(lo, hi) + randInt(1, 9) / 10);
  if (domain === 'money') return round2(randInt(lo, hi) + randInt(0, 99) / 100);
  return randInt(lo, hi);
}

function fmt(n: number, domain: NumberDomain): string {
  if (domain === 'money') return `$${n.toFixed(2)}`;
  if (domain === 'huge') return n.toLocaleString('en-US');
  if (domain === 'decimal') return `${Number(n.toFixed(2))}`;
  return `${n}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function randInt(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
