import { ExerciseType, NumberDomain } from '@/lib/math';

export type DomainDef = {
  id: NumberDomain;
  title: string;
  /** Short title used in grid cards. */
  card: string;
  blurb: string;
  /** Faint watermark drawn on the card (e.g. "123", "0.5"). */
  watermark: string;
  /** Which exercises this domain offers, in display order. */
  exercises: ExerciseType[];
  /** Marks the "Basics" section entry (Times tables) vs "Number types". */
  basic?: boolean;
};

const ALL: ExerciseType[] = [
  'add',
  'subtract',
  'multiply',
  'divide',
  'square',
  'sqrt',
  'fraction',
  'percent',
  'modulo',
];

export const DOMAINS: DomainDef[] = [
  {
    id: 'times',
    title: 'Times tables',
    card: 'Times tables',
    blurb: 'Drill the multiplication tables until they are automatic.',
    watermark: '×',
    exercises: ['multiply', 'divide'],
    basic: true,
  },
  {
    id: 'natural',
    title: 'Natural numbers',
    card: 'Natural',
    blurb: 'Whole numbers across every operation.',
    watermark: '123',
    exercises: ALL,
  },
  {
    id: 'decimal',
    title: 'Decimal numbers',
    card: 'Decimal',
    blurb: 'Numbers with decimal places.',
    watermark: '0.5',
    exercises: ['add', 'subtract', 'multiply', 'divide', 'percent'],
  },
  {
    id: 'money',
    title: 'Money',
    card: 'Money',
    blurb: 'Everyday currency amounts and percentages.',
    watermark: '$€¥',
    exercises: ['add', 'subtract', 'multiply', 'divide', 'percent'],
  },
  {
    id: 'huge',
    title: 'Huge numbers',
    card: 'Huge',
    blurb: 'Big numbers to stretch your working memory.',
    watermark: '000',
    exercises: ['add', 'subtract', 'multiply', 'divide'],
  },
];

export function getDomain(id: string | undefined): DomainDef {
  return DOMAINS.find((d) => d.id === id) ?? DOMAINS[1];
}

export const BASIC_DOMAINS = DOMAINS.filter((d) => d.basic);
export const NUMBER_TYPE_DOMAINS = DOMAINS.filter((d) => !d.basic);
