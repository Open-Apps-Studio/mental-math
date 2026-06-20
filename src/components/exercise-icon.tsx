import { Text, View } from 'react-native';
import { Palette } from '@/constants/theme';

type Props = {
  palette: Palette;
  symbol: string;
  /** Dimmed treatment for unavailable or inactive exercises. */
  muted?: boolean;
  size?: number;
};

// Solid green circle with a white operation glyph (the exercise list icons).
export function ExerciseIcon({ palette, symbol, muted, size = 30 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: muted ? palette.textFaint : palette.green,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: '#FFFFFF', fontSize: size * 0.5, fontWeight: '700' }}>{symbol}</Text>
    </View>
  );
}
