import { ColorSchemeName } from 'react-native';

export type Palette = {
  background: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  primary: string;
  primarySoft: string;
  success: string;
  danger: string;
  warning: string;
  blue: string;
  green: string;
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
  md: 16,
  lg: 24,
  pill: 999,
};

const light: Palette = {
  background: '#F6F9FC',
  surface: '#FFFFFF',
  surfaceStrong: '#EEF4FB',
  text: '#08111F',
  textMuted: '#506070',
  textFaint: '#8B97A4',
  border: '#DFE8F2',
  primary: '#1778F2',
  primarySoft: '#E5F1FF',
  success: '#16A66A',
  danger: '#EF4444',
  warning: '#F59E0B',
  blue: '#1778F2',
  green: '#18B981',
  purple: '#8B5CF6',
  orange: '#F97316',
};

const dark: Palette = {
  background: '#07111F',
  surface: '#0D1A2B',
  surfaceStrong: '#14243A',
  text: '#F4F8FF',
  textMuted: '#B6C2D0',
  textFaint: '#738198',
  border: '#23354F',
  primary: '#52A4FF',
  primarySoft: '#102B4D',
  success: '#36D399',
  danger: '#FB7185',
  warning: '#FBBF24',
  blue: '#52A4FF',
  green: '#36D399',
  purple: '#A78BFA',
  orange: '#FB923C',
};

export function getPalette(scheme: ColorSchemeName): Palette {
  return scheme === 'dark' ? dark : light;
}
