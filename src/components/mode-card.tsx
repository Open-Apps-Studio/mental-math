import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, radii, spacing } from '@/constants/theme';
import { PracticeMode } from '@/lib/math';

type Props = {
  mode: PracticeMode;
  palette: Palette;
  onPress: () => void;
  compact?: boolean;
};

export function ModeCard({ mode, palette, onPress, compact }: Props) {
  const accent = palette[mode.accent];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: radii.lg,
        padding: compact ? spacing.md : spacing.lg,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        gap: spacing.sm,
        opacity: pressed ? 0.78 : 1,
        boxShadow: '0 8px 22px rgba(8, 17, 31, 0.08)',
      })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: compact ? 44 : 54,
            height: compact ? 44 : 54,
            borderRadius: radii.md,
            backgroundColor: `${accent}22`,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: accent, fontSize: compact ? 22 : 26, fontWeight: '900' }}>{mode.symbol}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: palette.text, fontSize: compact ? 16 : 18, fontWeight: '900' }}>{mode.title}</Text>
          <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 18 }}>{mode.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.textFaint} />
      </View>
    </Pressable>
  );
}
