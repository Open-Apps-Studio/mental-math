import { ComponentProps } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, radii } from '@/constants/theme';
import { ExerciseType } from '@/lib/math';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const EXERCISE_ICONS: Record<ExerciseType, IconName> = {
  add: 'plus',
  subtract: 'minus',
  multiply: 'close',
  divide: 'division',
  square: 'exponent',
  sqrt: 'square-root',
  fraction: 'fraction-one-half',
  percent: 'percent',
  modulo: 'percent-box-outline',
};

type Props = {
  palette: Palette;
  icon: IconName;
  /** Dimmed treatment for unavailable or inactive exercises. */
  muted?: boolean;
  size?: number;
};

// Soft green tile with a single icon (the test and exercise list icons).
export function ExerciseIcon({ palette, icon, muted, size = 36 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.sm,
        backgroundColor: muted ? palette.surfaceStrong : palette.greenSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <MaterialCommunityIcons name={icon} size={Math.round(size * 0.62)} color={muted ? palette.textMuted : palette.green} />
    </View>
  );
}
