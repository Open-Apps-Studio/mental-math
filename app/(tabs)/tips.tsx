import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { getPalette, radii, spacing } from '@/constants/theme';
import { TIPS } from '@/data/tips';

export default function TipsScreen() {
  const palette = getPalette(useColorScheme());

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <View style={{ borderRadius: radii.lg, padding: spacing.lg, backgroundColor: palette.primarySoft, gap: spacing.xs }}>
        <Text style={{ color: palette.text, fontSize: 24, fontWeight: '900' }}>Mental shortcuts</Text>
        <Text style={{ color: palette.textMuted, fontSize: 15, lineHeight: 22 }}>
          Speed comes from patterns. Use these during drills until they become automatic.
        </Text>
      </View>
      {TIPS.map((tip) => (
        <View key={tip.title} style={{ borderRadius: radii.lg, padding: spacing.lg, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, gap: spacing.sm }}>
          <Text style={{ color: palette.text, fontSize: 18, fontWeight: '900' }}>{tip.title}</Text>
          <Text style={{ color: palette.textMuted, fontSize: 15, lineHeight: 22 }}>{tip.body}</Text>
          <Text style={{ color: palette.primary, fontSize: 15, fontWeight: '800' }}>{tip.example}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
