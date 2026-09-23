// "Practice this trick" drills: one question generator per Knowledge trick, so
// a drill only asks problems the trick actually speeds up (× 11 drills use
// two-digit numbers, "near 100" uses 90-99, and so on).

import { makeQuestion, type ExerciseType, type Question } from '@/lib/math';

type Drill = () => Question;

const r = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
/** Two-digit number whose ones digit is not 0 (keeps "round" cases out). */
const twoDigit = () => {
  let n = r(12, 98);
  while (n % 10 === 0) n = r(12, 98);
  return n;
};

const add = (a: number, b: number) => makeQuestion(`${a} + ${b}`, a + b, 'add');
const sub = (a: number, b: number) => makeQuestion(`${a} − ${b}`, a - b, 'subtract');
const mul = (a: number, b: number) => makeQuestion(`${a} × ${b}`, a * b, 'multiply');
const div = (dividend: number, divisor: number) => makeQuestion(`${dividend} ÷ ${divisor}`, dividend / divisor, 'divide');
const sq = (n: number) => makeQuestion(`${n}²`, n * n, 'square');
const rem = (n: number, d: number) => makeQuestion(`Remainder of ${n} ÷ ${d}`, n % d, 'modulo');

const DRILLS: Record<string, Drill> = {
  // Addition
  'add-left-to-right': () => add(twoDigit(), twoDigit()),
  'add-make-tens': () => add(r(1, 9) * 10 + pick([7, 8, 9]), twoDigit()),
  'add-split': () => add(twoDigit(), twoDigit()),
  'add-compensate': () => add(r(1, 9) * 10 + 9, twoDigit()),
  'add-doubles': () => {
    const a = r(3, 49);
    return add(a, a + pick([1, 2]));
  },

  // Subtraction
  'sub-split-one': () => {
    const a = r(50, 99);
    return sub(a, r(12, a - 10));
  },
  'sub-split-both': () => {
    const a = r(50, 99);
    return sub(a, r(12, a - 10));
  },
  'sub-compatible': () => sub(r(60, 99), r(2, 8) * 10 - pick([1, 2, 3])),
  'sub-compensate': () => sub(r(40, 99), r(1, 3) * 10 + 9),
  'sub-add-uniformly': () => sub(r(60, 99), r(2, 5) * 10 + pick([6, 7, 8, 9])),
  'sub-avoid-carryover': () => sub(r(5, 9) * 10 + r(0, 4), r(1, 4) * 10 + r(5, 9)),
  'sub-from-1000': () => sub(1000, r(101, 999)),
  'sub-continue-counting': () => {
    const b = r(21, 79);
    return sub(b + r(8, 30), b);
  },

  // Multiplication
  'mul-x2': () => mul(r(13, 99), 2),
  'mul-x4': () => mul(r(13, 99), 4),
  'mul-x5': () => mul(r(12, 99), 5),
  'mul-x9': () => mul(r(3, 19), 9),
  'mul-x9-fingers': () => mul(r(2, 10), 9),
  'mul-x10': () => mul(r(12, 999), 10),
  'mul-x11-small': () => {
    let n = twoDigit();
    while (Math.floor(n / 10) + (n % 10) >= 10) n = twoDigit();
    return mul(n, 11);
  },
  'mul-x11-carry': () => {
    let n = twoDigit();
    while (Math.floor(n / 10) + (n % 10) < 10) n = twoDigit();
    return mul(n, 11);
  },
  'mul-x12': () => mul(r(11, 30), 12),
  'mul-x15': () => mul(r(4, 30) * 2, 15),
  'mul-x25': () => mul(r(3, 30) * 4, 25),
  'mul-x50': () => mul(r(3, 49) * 2, 50),
  'mul-x99': () => mul(r(3, 25), 99),
  'mul-distribute': () => mul(r(12, 29), r(3, 9)),
  'mul-round-adjust': () => mul(r(1, 9) * 10 + pick([8, 9]), r(3, 9)),
  'mul-halve-double': () => mul(r(2, 12) * 4, pick([25, 50])),
  'mul-difference-squares': () => {
    const mid = r(2, 9) * 10;
    const d = r(1, 4);
    return mul(mid - d, mid + d);
  },
  'mul-near-100': () => mul(r(88, 99), r(88, 99)),
  'mul-by-doubling': () => mul(r(11, 19), pick([4, 8, 12, 16])),
  'mul-square-base': () => {
    const mid = r(11, 19);
    return mul(mid - 1, mid + 1);
  },
  'mul-decimal-shift': () => {
    const a = r(2, 9) / 10;
    const b = r(11, 19) / 10;
    return makeQuestion(`${a} × ${b}`, a * b, 'multiply', true);
  },

  // Division
  'div-by-2': () => div(r(26, 499) * 2, 2),
  'div-by-4': () => div(r(13, 99) * 4, 4),
  'div-by-5': () => div(r(13, 99) * 5, 5),
  'div-by-10': () => div(r(12, 999) * 10, 10),
  'div-by-25': () => div(r(4, 40) * 25, 25),
  'div-factor': () => {
    const d = pick([12, 14, 15, 16, 18, 24]);
    return div(r(6, 25) * d, d);
  },
  'div-rule-3': () => rem(r(100, 9999), 3),
  'div-rule-9': () => rem(r(100, 9999), 9),
  'div-rule-11': () => rem(r(1000, 9999), 11),

  // Squares
  'sq-end-5': () => sq(r(1, 9) * 10 + 5),
  'sq-near-base': () => sq(r(2, 9) * 10 + pick([1, 2, 3, -1, -2])),
  'sq-difference': () => sq(r(21, 99)),
  'sq-add-odd': () => sq(r(11, 25)),
  'sq-anchor-50': () => sq(50 + pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])),
};

/** Operation to credit the drill to in stats; falls back to the category's. */
const CATEGORY_EXERCISE: Record<string, ExerciseType> = {
  addition: 'add',
  subtraction: 'subtract',
  multiplication: 'multiply',
  division: 'divide',
  squares: 'square',
};

export function trickDrill(trickId: string | undefined): Drill | null {
  return (trickId && DRILLS[trickId]) || null;
}

export function exerciseForCategory(categoryId: string): ExerciseType {
  return CATEGORY_EXERCISE[categoryId] ?? 'add';
}
