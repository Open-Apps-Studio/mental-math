// Magic Square puzzle generation.
//
// A 3×3 magic square uses nine evenly spaced numbers (start, start+step, ...)
// so every row, column and diagonal has the same sum. There are exactly eight
// such squares for a given number set (rotations/reflections of one), so a
// puzzle is unique when its given cells match only one of those eight.

import type { Difficulty } from '@/lib/math';

export type MagicPuzzle = {
  /** Row-major solution, 9 cells. */
  solution: number[];
  /** Row-major givens; null = blank for the player. */
  givens: (number | null)[];
  /** The nine numbers the player places (sorted). */
  numbers: number[];
  target: number;
};

// Lo Shu square, written with digits 0-8 so it can be scaled and shifted.
const BASE = [7, 0, 5, 2, 4, 6, 3, 8, 1];

const rotate = (s: number[]) => [s[6], s[3], s[0], s[7], s[4], s[1], s[8], s[5], s[2]];
const mirror = (s: number[]) => [s[2], s[1], s[0], s[5], s[4], s[3], s[8], s[7], s[6]];

function variants(square: number[]): number[][] {
  const out: number[][] = [];
  let s = square;
  for (let i = 0; i < 4; i++) {
    out.push(s, mirror(s));
    s = rotate(s);
  }
  return out;
}

export const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** Blanks per difficulty; harder levels also move away from plain 1-9. */
const BLANKS: Record<Difficulty, number> = { easy: 3, medium: 5, hard: 6, superhard: 7 };

const r = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generateMagicSquare(difficulty: Difficulty): MagicPuzzle {
  const start = difficulty === 'easy' || difficulty === 'medium' ? 1 : r(2, 20);
  const step = difficulty === 'superhard' ? r(2, 5) : 1;
  const all = variants(BASE.map((d) => start + d * step));
  const solution = all[Math.floor(Math.random() * all.length)];

  // Blank cells one at a time (random order), keeping a blank only while the
  // remaining givens still single out this exact square.
  const givens: (number | null)[] = [...solution];
  let blanks = 0;
  for (const cell of shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8])) {
    if (blanks >= BLANKS[difficulty]) break;
    const trial = [...givens];
    trial[cell] = null;
    const matches = all.filter((v) => trial.every((g, i) => g === null || g === v[i]));
    if (matches.length === 1) {
      givens[cell] = null;
      blanks++;
    }
  }

  return {
    solution,
    givens,
    numbers: [...solution].sort((a, b) => a - b),
    target: solution[0] + solution[1] + solution[2],
  };
}

/** Sum of a line, or null while any of its cells is empty. */
export function lineSum(cells: (number | null)[], line: number[]): number | null {
  let sum = 0;
  for (const i of line) {
    const v = cells[i];
    if (v == null) return null;
    sum += v;
  }
  return sum;
}
