import { Alert, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Card, GroupLabel, Row } from '@/components/list';
import { StatCard } from '@/components/stat-card';
import { getPalette, radii, spacing } from '@/constants/theme';
import { accuracy, lastSevenDays } from '@/lib/stats';
import { useScheme } from '@/lib/settings';
import { useStats } from '@/hooks/use-stats';

export default function ProgressScreen() {
  const palette = getPalette(useScheme());
  const { stats, clear } = useStats();
  const recent = stats.rounds.slice(0, 10);
  const week = lastSevenDays(stats);
  const longestStreak = Math.max(stats.longestStreak ?? 0, stats.streakDays);

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
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <GroupLabel palette={palette}>This week</GroupLabel>
          <Text style={{ color: palette.textMuted, fontSize: 13 }}>
            Longest streak: {longestStreak}d
          </Text>
        </View>
        <Card palette={palette}>
          <View style={{ flexDirection: 'row', paddingVertical: spacing.md, paddingHorizontal: spacing.sm }}>
            {week.map((day, index) => {
              const active = day.solved > 0;
              return (
                <View key={index} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      color: day.isToday ? palette.text : palette.textMuted,
                      fontSize: 12,
                      fontWeight: day.isToday ? '700' : '500',
                    }}>
                    {day.weekday}
                  </Text>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? `${palette.green}33` : palette.surfaceStrong,
                      borderWidth: day.isToday ? 1.5 : 0,
                      borderColor: palette.green,
                    }}>
                    <Text
                      style={{
                        color: active ? palette.green : palette.textFaint,
                        fontSize: 11,
                        fontWeight: '700',
                        fontVariant: ['tabular-nums'],
                      }}>
                      {active ? day.solved : '·'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
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
