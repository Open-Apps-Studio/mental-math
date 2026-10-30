import { DOMAINS } from '@/data/domains';
import { CATEGORIES } from '@/data/knowledge';
import { DIFFICULTIES, Difficulty, formatSeconds, generateQuestion, isCorrect, nextQuestion, Question } from '@/lib/math';
import { trickDrill } from '@/lib/trick-drills';

const LEVELS = DIFFICULTIES.map((d) => d.id);
const SAMPLES = 2000;

const sample = (make: () => Question, count = SAMPLES) => Array.from({ length: count }, make);

// Every question must be answerable on the on-screen keypad: there is no minus
// key, and the input stops at 9 characters.
function isAnswerable({ prompt, answer }: Question) {
  const typed = `${answer}`;
  return (
    Number.isFinite(answer) &&
    answer >= 0 &&
    typed.length <= 9 &&
    isCorrect(typed, answer) &&
    !/NaN|undefined|Infinity/.test(prompt)
  );
}

describe('generateQuestion', () => {
  describe.each(DOMAINS.flatMap((d) => d.exercises.flatMap((e) => LEVELS.map((l) => [d.id, e, l] as const))))(
    '%s / %s / %s',
    (domain, exercise, level) => {
      it('only produces answerable questions', () => {
        expect(sample(() => generateQuestion(exercise, domain, level)).filter((q) => !isAnswerable(q))).toEqual([]);
      });
    },
  );

  it.each(LEVELS)('offers a real pool of squares and roots on %s', (level) => {
    for (const exercise of ['square', 'sqrt'] as const) {
      const prompts = new Set(sample(() => generateQuestion(exercise, 'natural', level)).map((q) => q.prompt));
      expect(prompts.size).toBeGreaterThanOrEqual(14);
    }
  });

  it('makes percentages harder as difficulty rises', () => {
    const largest = (level: Difficulty) =>
      Math.max(...sample(() => generateQuestion('percent', 'natural', level)).map((q) => q.answer));
    expect(largest('easy')).toBeLessThan(largest('medium'));
    expect(largest('medium')).toBeLessThan(largest('hard'));
    expect(largest('hard')).toBeLessThan(largest('superhard'));
  });

  it('keeps natural-number percentages whole', () => {
    for (const level of LEVELS) {
      const fractional = sample(() => generateQuestion('percent', 'natural', level)).filter((q) => !Number.isInteger(q.answer));
      expect(fractional).toEqual([]);
    }
  });

  it('asks decimal percentages of decimal numbers, with exact answers', () => {
    const questions = sample(() => generateQuestion('percent', 'decimal', 'medium'));
    expect(questions.some((q) => /of \d+\.\d/.test(q.prompt))).toBe(true);
    questions.forEach((q) => {
      const [, percent, base] = q.prompt.match(/^(\d+)% of ([\d.]+)$/)!;
      expect(q.answer).toBeCloseTo((Number(percent) / 100) * Number(base), 8);
    });
  });

  it('only uses fractions in lowest terms', () => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    sample(() => generateQuestion('fraction', 'natural', 'hard')).forEach((q) => {
      const [, numer, denom] = q.prompt.match(/^(\d+)\/(\d+) of/)!;
      expect(gcd(Number(numer), Number(denom))).toBe(1);
    });
  });
});

describe('trick drills', () => {
  const tricks = CATEGORIES.flatMap((c) => c.tricks);

  it.each(tricks.map((t) => t.id))('%s has an answerable drill', (id) => {
    const drill = trickDrill(id);
    expect(drill).not.toBeNull();
    expect(sample(drill!).filter((q) => !isAnswerable(q))).toEqual([]);
  });
});

describe('nextQuestion', () => {
  it('never repeats the previous prompt', () => {
    let prompt: string | undefined;
    for (let i = 0; i < SAMPLES; i++) {
      const question = nextQuestion(() => generateQuestion('square', 'natural', 'easy'), prompt);
      expect(question.prompt).not.toBe(prompt);
      prompt = question.prompt;
    }
  });

  it('gives up rather than hanging when only one question exists', () => {
    const only: Question = { prompt: '1 + 1', answer: 2, displayAnswer: '2', exercise: 'add', decimal: false };
    expect(nextQuestion(() => only, only.prompt)).toBe(only);
  });
});

describe('isCorrect', () => {
  it('accepts exact answers and decimal commas', () => {
    expect(isCorrect('12', 12)).toBe(true);
    expect(isCorrect('12.5', 12.5)).toBe(true);
    expect(isCorrect('12,5', 12.5)).toBe(true);
    expect(isCorrect('$12.50', 12.5)).toBe(true);
  });

  it('waits while the answer is still being typed', () => {
    expect(isCorrect('', 12)).toBe(false);
    expect(isCorrect('1', 12)).toBe(false);
    expect(isCorrect('12.', 12)).toBe(false);
    expect(isCorrect('12,', 12)).toBe(false);
  });
});

describe('formatSeconds', () => {
  it('formats minutes and pads seconds', () => {
    expect(formatSeconds(0)).toBe('0:00');
    expect(formatSeconds(65)).toBe('1:05');
    expect(formatSeconds(Number.NaN)).toBe('0:00');
  });
});
