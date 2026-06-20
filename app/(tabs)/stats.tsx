import { Alert, Pressable, ScrollView, Text, View, useColorScheme } from 'react-native';
import { StatCard } from '@/components/stat-card';
import { getPalette, radii, spacing } from '@/constants/theme';
import { PRACTICE_MODES } from '@/lib/math';
import { accuracy } from '@/lib/stats';
import { useStats } from '@/hooks/use-stats';

export default function StatsScreen() {
  const palette = getPalette(useColorScheme());
  const { stats, clear } = useStats();

  const confirmReset = () => {
    Alert.alert('Reset stats?', 'This clears local round history on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void clear() },
    ]);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <StatCard label="Correct" value={`${stats.totalCorrect}`} palette={palette} tone="green" />
        <StatCard label="Accuracy" value={`${accuracy(stats.totalCorrect, stats.totalAttempted)}%`} palette={palette} tone="blue" />
        <StatCard label="Rounds" value={`${stats.rounds.length}`} palette={palette} tone="purple" />
        <StatCard label="Streak" value={`${stats.streakDays}d`} palette={palette} tone="orange" />
      </View>

      <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900' }}>Best by mode</Text>
      {PRACTICE_MODES.map((mode) => {
        const best = stats.bestByMode[mode.id];
        return (
          <View
            key={mode.id}
            style={{
              borderRadius: radii.lg,
              padding: spacing.md,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            }}>
            <Text style={{ color: palette[mode.accent], fontSize: 24, fontWeight: '900', width: 42 }}>{mode.symbol}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.text, fontSize: 16, fontWeight: '900' }}>{mode.title}</Text>
              <Text style={{ color: palette.textMuted, fontSize: 13 }}>
                {best ? `${best.correct} correct • ${Math.round(best.accuracy * 100)}% accuracy` : 'No round yet'}
              </Text>
            </View>
          </View>
        );
      })}

      <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900' }}>Recent rounds</Text>
      {stats.rounds.slice(0, 8).map((round) => (
        <View key={round.id} style={{ borderRadius: radii.md, padding: spacing.md, backgroundColor: palette.surfaceStrong }}>
          <Text style={{ color: palette.text, fontSize: 15, fontWeight: '800' }}>
            {round.mode} • {round.correct}/{round.attempted}
          </Text>
          <Text style={{ color: palette.textMuted, fontSize: 12 }}>{new Date(round.createdAt).toLocaleString()}</Text>
        </View>
      ))}

      <Pressable onPress={confirmReset} style={{ alignSelf: 'center', padding: spacing.md }}>
        <Text style={{ color: palette.danger, fontWeight: '800' }}>Reset local stats</Text>
      </Pressable>
    </ScrollView>
  );
}
