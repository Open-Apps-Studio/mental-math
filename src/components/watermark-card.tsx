import { Pressable, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, radii, spacing } from '@/constants/theme';

type Props = {
  palette: Palette;
  title: string;
  sublabel?: string;
  /** Big faint glyph drawn bottom-right (e.g. "123", "$€¥", "★"). */
  watermark: string;
  onPress: () => void;
  /** Filled green treatment (used for the Favorites card). */
  filled?: boolean;
  style?: ViewStyle;
  minHeight?: number;
};

// Card with an oversized faint watermark, used in the Trainer number-type grid
// and the Knowledge category grid.
export function WatermarkCard({ palette, title, sublabel, watermark, onPress, filled, style, minHeight = 92 }: Props) {
  const bg = filled ? palette.green : palette.surface;
  const fg = filled ? '#FFFFFF' : palette.text;
  const subFg = filled ? 'rgba(255,255,255,0.85)' : palette.textMuted;
  const markColor = filled ? 'rgba(255,255,255,0.28)' : palette.textFaint;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: radii.lg,
          backgroundColor: bg,
          borderWidth: filled ? 0 : 1,
          borderColor: palette.border,
          padding: spacing.md,
          minHeight,
          justifyContent: 'flex-start',
          overflow: 'hidden',
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}>
      <Text
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: 10,
          bottom: -6,
          fontSize: 56,
          fontWeight: '800',
          color: markColor,
          opacity: filled ? 1 : 0.35,
        }}>
        {watermark}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <Text style={{ color: fg, fontSize: 18, fontWeight: '700' }}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color={filled ? '#FFFFFF' : palette.textFaint} />
      </View>
      {sublabel ? <Text style={{ color: subFg, fontSize: 14, marginTop: 2 }}>{sublabel}</Text> : null}
    </Pressable>
  );
}
