import { router } from 'expo-router';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { AppButton } from '@/components/app-button';
import { ModeCard } from '@/components/mode-card';
import { getPalette, radii, spacing } from '@/constants/theme';
import { PRACTICE_MODES } from '@/lib/math';

export default function TrainScreen() {
  const palette = getPalette(useColorScheme());

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <View style={{ borderRadius: radii.lg, padding: spacing.lg, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, gap: spacing.sm }}>
        <Text style={{ color: palette.text, fontSize: 24, fontWeight: '900' }}>Choose a drill</Text>
        <Text style={{ color: palette.textMuted, fontSize: 15, lineHeight: 22 }}>
          Sprint for 60 seconds, or use unlimited mode when you want low-pressure repetition.
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <AppButton title="60s mixed sprint" palette={palette} onPress={() => router.push({ pathname: '/session', params: { mode: 'mixed', kind: 'timed' } })} />
          <AppButton title="Unlimited mixed" palette={palette} variant="secondary" onPress={() => router.push({ pathname: '/session', params: { mode: 'mixed', kind: 'unlimited' } })} />
        </View>
      </View>

      {PRACTICE_MODES.map((mode) => (
        <ModeCard
          key={mode.id}
          mode={mode}
          palette={palette}
          onPress={() => router.push({ pathname: '/session', params: { mode: mode.id, kind: 'timed' } })}
        />
      ))}
    </ScrollView>
  );
}
