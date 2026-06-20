import { Text, View } from 'react-native';
import { Palette, radii, spacing } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  palette: Palette;
  tone?: keyof Pick<Palette, 'blue' | 'green' | 'purple' | 'orange' | 'primary'>;
};

export function StatCard({ label, value, palette, tone = 'primary' }: Props) {
  const color = palette[tone];

  return (
    <View
      style={{
        flex: 1,
        minWidth: 145,
        borderRadius: radii.lg,
        padding: spacing.md,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        gap: spacing.xs,
      }}>
      <Text style={{ color: palette.textMuted, fontSize: 13, fontWeight: '700' }}>{label}</Text>
      <Text style={{ color, fontSize: 28, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}
