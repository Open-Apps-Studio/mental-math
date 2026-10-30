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
  { id: 'add', label: 'Addition' },
  { id: 'subtract', label: 'Subtraction' },
  { id: 'multiply', label: 'Multiplication' },
  { id: 'divide', label: 'Division' },
  { id: 'square', label: 'Squares' },
  { id: 'sqrt', label: 'Square roots' },
  { id: 'fraction', label: 'Fractions' },
  { id: 'percent', label: 'Percentages' },
  { id: 'modulo', label: 'Modulo' },
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

// The number being squared, or the answer to a square root.
const ROOT_RANGES: Record<Difficulty, [number, number]> = {
  easy: [2, 15],
  medium: [5, 25],
  hard: [11, 50],
  superhard: [21, 99],
};

// "a/b of N" fractions, all in lowest terms.
const FRACTIONS: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [1, 6],
  [5, 6],
  [1, 8],
  [3, 8],
  [5, 8],
  [7, 8],
  [1, 10],
  [3, 10],
  [7, 10],
  [9, 10],
];

/** [percent, base] for a whole-number percent question at this difficulty. */
function wholePercent(difficulty: Difficulty): [number, number] {
  switch (difficulty) {
    case 'easy':
      return [pick([10, 20, 25, 50]), 20 * randInt(1, 10)];
    case 'hard':
      // A multiple of 5 percent of a multiple of 20 is always whole.
      return [5 * randInt(1, 19), 20 * randInt(3, 50)];
    case 'superhard':
      return [randInt(3, 97), 100 * randInt(2, 30)];
    default:
      return [pick([5, 10, 15, 20, 25, 40, 50, 75]), pick([20, 40, 60, 80, 120, 160, 200, 400])];
  }
}

export function generateQuestion(
  exercise: ExerciseType,
  domain: NumberDomain,
  difficulty: Difficulty,
): Question {
  const safeDomain: NumberDomain = RANGES[domain] ? domain : 'natural';
  const safeDifficulty: Difficulty = RANGES[safeDomain]?.[difficulty] ? difficulty : 'medium';
  const [lo, hi] = RANGES[safeDomain][safeDifficulty];
  const money = safeDomain === 'money';
  const decimal = safeDomain === 'decimal' || money;

  switch (exercise) {
    case 'add': {
      const a = operand(safeDomain, lo, hi);
      const b = operand(safeDomain, lo, hi);
      return build(`${fmt(a, safeDomain)} + ${fmt(b, safeDomain)}`, a + b, exercise, safeDomain);
    }
    case 'subtract': {
      let a = operand(safeDomain, lo, hi);
      let b = operand(safeDomain, lo, hi);
      if (b > a) [a, b] = [b, a];
      return build(`${fmt(a, safeDomain)} − ${fmt(b, safeDomain)}`, a - b, exercise, safeDomain);
    }
    case 'multiply': {
      // Keep the second factor small so products stay mental-mathable.
      const a = operand(safeDomain, lo, hi);
      const b = safeDomain === 'times' ? randInt(lo, hi) : randInt(2, decimal ? 9 : Math.min(12, hi));
      return build(`${fmt(a, safeDomain)} × ${b}`, a * b, exercise, safeDomain);
    }
    case 'divide': {
      // Generate from the answer so quotients are clean.
      const divisor = randInt(2, safeDomain === 'times' ? hi : 12);
      const quotient = operand(safeDomain, lo, hi);
      const dividend = round2(divisor * quotient);
      return build(`${fmt(dividend, safeDomain)} ÷ ${divisor}`, quotient, exercise, safeDomain);
    }
    case 'square': {
      const n = randInt(...ROOT_RANGES[safeDifficulty]);
      return build(`${n}²`, n * n, 'square', 'natural');
    }
    case 'sqrt': {
      const n = randInt(...ROOT_RANGES[safeDifficulty]);
      return build(`√${n * n}`, n, 'sqrt', 'natural');
    }
    case 'fraction': {
      // "a/b of N" with an integer answer.
      const [numer, denom] = pick(FRACTIONS);
      const multiple = randInt(2, Math.max(3, Math.round(hi / denom)));
      const base = denom * multiple;
      return build(`${numer}/${denom} of ${base}`, (numer * base) / denom, 'fraction', 'natural');
    }
    case 'percent': {
      if (money) {
        const percent = pick([5, 10, 15, 20, 25, 40, 50, 75]);
        const base = round2(randInt(lo, hi) + 0.5);
        return build(`${percent}% of ${fmt(base, safeDomain)}`, round2((percent / 100) * base), 'percent', safeDomain);
      }
      if (safeDomain === 'decimal') {
        // Tens of percent keep a one-decimal base within two decimal places.
        const percent = pick(safeDifficulty === 'easy' ? [10, 20, 50] : [10, 20, 30, 40, 50, 60, 70, 80, 90]);
        const base = operand(safeDomain, lo, hi);
        return build(`${percent}% of ${fmt(base, safeDomain)}`, (percent / 100) * base, 'percent', safeDomain);
      }
      const [percent, base] = wholePercent(safeDifficulty);
      return build(`${percent}% of ${base}`, (percent * base) / 100, 'percent', safeDomain);
    }
    case 'modulo': {
      const a = randInt(lo, hi);
      const b = randInt(2, 9);
      return build(`${a} mod ${b}`, a % b, 'modulo', 'natural');
    }
    default:
      return build('1 + 1', 2, 'add', 'natural');
  }
}

export function isCorrect(input: string, answer: number): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed.endsWith('.') || trimmed.endsWith(',')) return false;
  const normalized = trimmed.replace(/^\$/, '').replace(',', '.');
  const value = Number(normalized);
  if (!Number.isFinite(value)) return false;
  return Math.abs(value - answer) < 0.005;
}

export function formatSeconds(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Re-rolls so a round never shows the same prompt twice in a row. */
export function nextQuestion(generate: () => Question, previousPrompt?: string): Question {
  let question = generate();
  for (let i = 0; i < 20 && question.prompt === previousPrompt; i++) {
    question = generate();
  }
  return question;
}

/** Build a question outside the domain generators (used by trick drills). */
export function makeQuestion(prompt: string, answer: number, exercise: ExerciseType, decimal = false): Question {
  return build(prompt, answer, exercise, decimal ? 'decimal' : 'natural');
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
  // Math.round(n * 100) alone mis-rounds ties like 0.15 * 1.5 = 0.225, which
  // binary floats store as 0.224999999999999982... -- it rounds DOWN to 0.22
  // instead of the 0.23 a person gets by hand. Money-domain percent questions
  // hit this constantly because their base always ends in exactly .50 (see
  // generateQuestion 'percent'), so ties are common, not rare. A tiny nudge
  // toward the intended tie-breaking direction fixes it without touching any
  // non-tie case -- it's 100,000x smaller than the 0.005 tolerance isCorrect()
  // already allows.
  const nudge = n < 0 ? -1e-9 : 1e-9;
  return Math.round(n * 100 + nudge) / 100;
}

function randInt(min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
