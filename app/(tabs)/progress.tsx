import { Alert, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Card, GroupLabel, Row } from '@/components/list';
import { StatCard } from '@/components/stat-card';
import { getPalette, radii, spacing } from '@/constants/theme';
import { accuracy } from '@/lib/stats';
import { useScheme } from '@/lib/settings';
import { useStats } from '@/hooks/use-stats';

export default function ProgressScreen() {
  const palette = getPalette(useScheme());
  const { stats, clear } = useStats();
  const recent = stats.rounds.slice(0, 10);

  const confirmReset = () => {
    Alert.alert('Reset progress?', 'This clears your local round history, streak, and best scores on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void clear() },
    ]);
  };

  return (
    <Screen palette={palette} title="Progress">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <StatCard label="Solved" value={`${stats.totalCorrect}`} palette={palette} tone="green" />
        <StatCard label="Accuracy" value={`${accuracy(stats.totalCorrect, stats.totalAttempted)}%`} palette={palette} tone="blue" />
        <StatCard label="Best run" value={`${stats.bestRun}`} palette={palette} tone="purple" />
        <StatCard label="Streak" value={`${stats.streakDays}d`} palette={palette} tone="orange" />
      </View>

      <View>
        <GroupLabel palette={palette}>Recent rounds</GroupLabel>
        {recent.length === 0 ? (
          <Card palette={palette}>
            <View style={{ padding: spacing.lg, alignItems: 'center', gap: spacing.xs }}>
              <Text style={{ color: palette.text, fontSize: 16, fontWeight: '600' }}>No rounds yet</Text>
              <Text style={{ color: palette.textMuted, fontSize: 14, textAlign: 'center' }}>
                Finish a test or trainer drill and it will show up here.
              </Text>
            </View>
          </Card>
        ) : (
          <Card palette={palette}>
            {recent.map((round, index) => (
              <Row
                key={round.id}
                palette={palette}
                label={round.title}
                sublabel={`${new Date(round.createdAt).toLocaleDateString()} · ${round.elapsedSeconds}s`}
                separator={index < recent.length - 1}
                right={
                  <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
                    {round.correct}/{round.attempted}
                  </Text>
                }
              />
            ))}
          </Card>
        )}
      </View>

      <Pressable
        onPress={confirmReset}
        style={({ pressed }) => ({
          borderRadius: radii.lg,
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.border,
          paddingVertical: spacing.md,
          alignItems: 'center',
          opacity: pressed ? 0.6 : 1,
        })}>
        <Text style={{ color: palette.danger, fontSize: 16, fontWeight: '600' }}>Reset progress</Text>
      </Pressable>
    </Screen>
  );
}
