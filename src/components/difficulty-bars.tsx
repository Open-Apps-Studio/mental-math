import { View } from 'react-native';
import { Palette } from '@/constants/theme';

type Props = {
  /** 1-4, how many bars are filled. */
  level: number;
  palette: Palette;
  /** Color of filled bars. Defaults to muted grey like iOS signal bars. */
  color?: string;
  size?: 'sm' | 'md';
};

// Cellular-signal-style difficulty indicator (4 bars of increasing height).
export function DifficultyBars({ level, palette, color, size = 'sm' }: Props) {
  const unit = size === 'sm' ? 3 : 4;
  const gap = size === 'sm' ? 2 : 3;
  const fill = color ?? palette.textMuted;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap }}>
      {[1, 2, 3, 4].map((bar) => (
        <View
          key={bar}
          style={{
            width: unit,
            height: unit * (bar + 1.5),
            borderRadius: 1.5,
            backgroundColor: bar <= level ? fill : palette.textFaint,
            opacity: bar <= level ? 1 : 0.45,
          }}
        />
      ))}
    </View>
  );
}
