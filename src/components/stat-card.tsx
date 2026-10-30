import { Text, View } from 'react-native';
import { Palette, radii, spacing } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  palette: Palette;
};

export function StatCard({ label, value, palette }: Props) {
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: '45%',
        borderRadius: radii.lg,
        padding: spacing.md,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        gap: spacing.xs,
      }}>
      <Text style={{ color: palette.textMuted, fontSize: 13, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: palette.text, fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}
