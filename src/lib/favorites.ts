import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// Favorited trick ids, surfaced in the Knowledge "Favorites" card.

const STORAGE_KEY = 'rapid_math_favorites_v1';

let ids: string[] = [];
let snapshot: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function rebuild() {
  snapshot = new Set(ids);
}

function emit() {
  rebuild();
  listeners.forEach((l) => l());
}

export async function hydrateFavorites(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    ids = raw ? JSON.parse(raw) : [];
  } catch {
    ids = [];
  }
  emit();
}

export function toggleFavorite(id: string): void {
  ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFavorites(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, () => snapshot);
}
