import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

export type ThemePref = 'system' | 'light' | 'dark';

export type Settings = {
  theme: ThemePref;
  haptics: boolean;
  sound: boolean;
};

const STORAGE_KEY = 'rapid_math_settings_v1';

const defaults: Settings = {
  theme: 'system',
  haptics: true,
  sound: true,
};

let state: Settings = defaults;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function hydrateSettings(): Promise<void> {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...defaults, ...JSON.parse(raw) };
  } catch {
    state = defaults;
  }
  hydrated = true;
  emit();
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  state = { ...state, [key]: value };
  persist();
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => state);
}

/** Effective color scheme after applying the user's theme override. */
export function useScheme(): ColorSchemeName {
  const system = useColorScheme();
  const { theme } = useSettings();
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  return system ?? 'light';
}
