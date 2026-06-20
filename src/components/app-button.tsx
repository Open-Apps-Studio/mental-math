import { Pressable, Text, ViewStyle } from 'react-native';
import { Palette, radii, spacing } from '@/constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  palette: Palette;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
};

export function AppButton({ title, onPress, palette, variant = 'primary', style }: Props) {
  const backgroundColor =
    variant === 'primary' ? palette.primary : variant === 'secondary' ? palette.surfaceStrong : 'transparent';
  const color = variant === 'primary' ? '#FFFFFF' : palette.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 52,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: palette.border,
          opacity: pressed ? 0.78 : 1,
        },
        style,
      ]}>
      <Text style={{ color, fontSize: 16, fontWeight: '800' }}>{title}</Text>
    </Pressable>
  );
}
