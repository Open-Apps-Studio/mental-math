import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, radii, spacing } from '@/constants/theme';

const decimalSeparator = (() => {
  try {
    const sep = (1.1).toLocaleString().substring(1, 2);
    return sep === ',' ? ',' : '.';
  } catch {
    return '.';
  }
})();

const keyRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  [decimalSeparator, '0', '⌫'],
];

type Props = {
  palette: Palette;
  onKey: (key: string) => void;
  disabled?: boolean;
  keyHeight?: number;
};

// Numeric entry pad. There is no submit key — the round auto-advances as soon
// as the typed value matches the answer.
export function Keypad({ palette, onKey, disabled, keyHeight = 62 }: Props) {
  return (
    <View style={{ gap: spacing.sm }}>
      {keyRows.map((row) => (
        <View key={row.join('')} style={{ flexDirection: 'row', gap: spacing.sm }}>
          {row.map((key) => {
            const isBackspace = key === '⌫';
            const isDecimal = key === '.' || key === ',';
            const a11yLabel = isBackspace ? 'Backspace' : isDecimal ? 'Decimal point' : key;
            return (
              <Pressable
                key={key}
                disabled={disabled}
                onPress={() => onKey(key)}
                accessibilityRole="button"
                accessibilityLabel={a11yLabel}
                style={({ pressed }) => ({
                  flex: 1,
                  height: keyHeight,
                  borderRadius: radii.md,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: disabled ? 0.4 : pressed ? 0.72 : 1,
                })}>
                {isBackspace ? (
                  <Ionicons name="backspace-outline" size={28} color={palette.text} />
                ) : (
                  <Text style={{ color: palette.text, fontSize: 24, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{key}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
