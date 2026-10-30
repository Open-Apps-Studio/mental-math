import { generateMagicSquare, LINES, lineSum } from '@/lib/magic-square';
import { DIFFICULTIES } from '@/lib/math';

describe.each(DIFFICULTIES.map((d) => d.id))('generateMagicSquare(%s)', (difficulty) => {
  const puzzles = Array.from({ length: 300 }, () => generateMagicSquare(difficulty));

  it('produces a solved square where every line hits the target', () => {
    for (const puzzle of puzzles) {
      for (const line of LINES) {
        expect(lineSum(puzzle.solution, line)).toBe(puzzle.target);
      }
    }
  });

  it('offers nine distinct numbers that match the solution', () => {
    for (const puzzle of puzzles) {
      expect(new Set(puzzle.numbers).size).toBe(9);
      expect([...puzzle.numbers].sort((a, b) => a - b)).toEqual([...puzzle.solution].sort((a, b) => a - b));
    }
  });

  it('leaves at least one blank and never gives a wrong number', () => {
    for (const puzzle of puzzles) {
      expect(puzzle.givens.some((g) => g === null)).toBe(true);
      puzzle.givens.forEach((given, i) => {
        if (given !== null) expect(given).toBe(puzzle.solution[i]);
      });
    }
  });
});

describe('lineSum', () => {
  it('is null until the line is complete', () => {
    expect(lineSum([1, 2, null, 4, 5, 6, 7, 8, 9], LINES[0])).toBeNull();
    expect(lineSum([1, 2, 3, 4, 5, 6, 7, 8, 9], LINES[0])).toBe(6);
  });
});
