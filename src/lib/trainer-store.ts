import { useSyncExternalStore } from 'react';
import { Difficulty, ExerciseType, NumberDomain } from '@/lib/math';

// Holds the exercise selection while the user configures a drill, plus the
// session config that the session screen reads when launched.

export type SessionConfig = {
  title: string;
  /** Best-score grouping key. */
  statKey: string;
  domain: NumberDomain;
  exercises: ExerciseType[];
  /** Per-exercise difficulty; falls back to medium. */
  difficulty: Record<string, Difficulty>;
  kind: 'timed' | 'unlimited';
  seconds: number;
  /** When set, questions come from this Knowledge trick's drill instead. */
  trickId?: string;
};

type Selection = {
  domain: NumberDomain | null;
  selected: ExerciseType[];
  difficulty: Record<string, Difficulty>;
  /** Round length in seconds; 0 means no time limit. */
  seconds: number;
};

export const ROUND_LENGTHS = [
  { value: '30', label: '30s' },
  { value: '60', label: '1 min' },
  { value: '120', label: '2 min' },
  { value: '0', label: 'No limit' },
];

let selection: Selection = { domain: null, selected: [], difficulty: {}, seconds: 60 };
let pendingSession: SessionConfig | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Begin (or resume) configuring a domain. Resets when switching domains. */
export function openDomain(domain: NumberDomain): void {
  if (selection.domain !== domain) {
    selection = { ...selection, domain, selected: [], difficulty: {} };
    emit();
  }
}

export function toggleExercise(exercise: ExerciseType): void {
  const has = selection.selected.includes(exercise);
  selection = {
    ...selection,
    selected: has ? selection.selected.filter((e) => e !== exercise) : [...selection.selected, exercise],
  };
  emit();
}

export function setDifficulty(exercise: ExerciseType, difficulty: Difficulty): void {
  selection = { ...selection, difficulty: { ...selection.difficulty, [exercise]: difficulty } };
  emit();
}

export function setRoundLength(seconds: number): void {
  selection = { ...selection, seconds };
  emit();
}

export function difficultyFor(exercise: ExerciseType): Difficulty {
  return selection.difficulty[exercise] ?? 'medium';
}

export function useSelection(): Selection {
  return useSyncExternalStore(subscribe, () => selection);
}

/** Stash a config and let the caller navigate to /session. */
export function startSession(config: SessionConfig): void {
  pendingSession = config;
}

export function getPendingSession(): SessionConfig | null {
  return pendingSession;
}
