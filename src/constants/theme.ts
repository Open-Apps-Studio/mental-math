import { ColorSchemeName } from 'react-native';

export type Palette = {
  /** Grouped screen background (behind cards). */
  background: string;
  /** Card / list surface. */
  surface: string;
  /** Secondary surface used for inset rows, example boxes, watermarks. */
  surfaceStrong: string;
  /** Segmented-control track background. */
  track: string;
  text: string;
  textMuted: string;
  textFaint: string;
  /** Hairline separator between list rows. */
  separator: string;
  border: string;
  primary: string;
  primarySoft: string;
  success: string;
  danger: string;
  warning: string;
  blue: string;
  green: string;
  greenSoft: string;
  purple: string;
  orange: string;
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 26,
  pill: 999,
};

// iOS system-grouped palette so the clone reads like a native settings/list app.
const light: Palette = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceStrong: '#EDEDF2',
  track: '#E3E3E8',
  text: '#000000',
  textMuted: '#6C6C70',
  textFaint: '#B8B8BE',
  separator: '#D6D6DB',
  border: '#E2E2E7',
  primary: '#007AFF',
  primarySoft: '#E5F0FF',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  blue: '#007AFF',
  green: '#34C759',
  greenSoft: '#E4F8EA',
  purple: '#AF52DE',
  orange: '#FF9500',
};

const dark: Palette = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceStrong: '#2C2C2E',
  track: '#2C2C2E',
  text: '#FFFFFF',
  textMuted: '#98989F',
  textFaint: '#5A5A5F',
  separator: '#38383A',
  border: '#38383A',
  primary: '#0A84FF',
  primarySoft: '#0E2942',
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  blue: '#0A84FF',
  green: '#30D158',
  greenSoft: '#16331F',
  purple: '#BF5AF2',
  orange: '#FF9F0A',
};

export function getPalette(scheme: ColorSchemeName): Palette {
  return scheme === 'dark' ? dark : light;
}
