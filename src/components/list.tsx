import { ReactNode } from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, radii, spacing } from '@/constants/theme';

/** Rounded surface that groups list rows, iOS-inset style. */
export function Card({ palette, children, style }: { palette: Palette; children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          borderRadius: radii.lg,
          backgroundColor: palette.surface,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: palette.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

/** Bold dark heading used for top-level page sections (e.g. "Basics"). */
export function SectionTitle({ palette, children, style }: { palette: Palette; children: ReactNode; style?: TextStyle }) {
  return (
    <Text style={[{ color: palette.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }, style]}>{children}</Text>
  );
}

/** Small grey label above a grouped list (e.g. "Exercise types"). */
export function GroupLabel({ palette, children }: { palette: Palette; children: ReactNode }) {
  return (
    <Text style={{ color: palette.textMuted, fontSize: 13, fontWeight: '600', marginLeft: spacing.xs, marginBottom: spacing.xs }}>
      {children}
    </Text>
  );
}

type RowProps = {
  palette: Palette;
  label: string;
  sublabel?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  separator?: boolean;
  disabled?: boolean;
  labelColor?: string;
};

/** Single list row with optional leading icon, trailing content, and chevron. */
export function Row({
  palette,
  label,
  sublabel,
  left,
  right,
  onPress,
  chevron,
  separator = true,
  disabled,
  labelColor,
}: RowProps) {
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, minHeight: 52 }}>
      {left}
      <View style={{ flex: 1, gap: 2, paddingVertical: spacing.sm }}>
        <Text style={{ color: labelColor ?? (disabled ? palette.textFaint : palette.text), fontSize: 17, fontWeight: '500' }}>
          {label}
        </Text>
        {sublabel ? <Text style={{ color: palette.textMuted, fontSize: 13 }}>{sublabel}</Text> : null}
      </View>
      {right}
      {chevron ? <Ionicons name="chevron-forward" size={18} color={palette.textFaint} /> : null}
    </View>
  );

  const inner = separator ? (
    <View style={{ borderBottomWidth: 0.5, borderBottomColor: palette.separator }}>{content}</View>
  ) : (
    content
  );

  if (!onPress) return inner;

  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.55 : 1 })}>
      {inner}
    </Pressable>
  );
}
