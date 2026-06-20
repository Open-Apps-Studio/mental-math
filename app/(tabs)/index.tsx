import { router } from 'expo-router';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { AppButton } from '@/components/app-button';
import { ModeCard } from '@/components/mode-card';
import { StatCard } from '@/components/stat-card';
import { getPalette, radii, spacing } from '@/constants/theme';
import { PRACTICE_MODES } from '@/lib/math';
import { accuracy } from '@/lib/stats';
import { useStats } from '@/hooks/use-stats';

export default function TodayScreen() {
  const palette = getPalette(useColorScheme());
  const { stats } = useStats();
  const recent = stats.rounds[0];
  const totalAccuracy = useMemo(() => accuracy(stats.totalCorrect, stats.totalAttempted), [stats.totalAttempted, stats.totalCorrect]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <View
        style={{
          borderRadius: radii.lg,
          padding: spacing.lg,
          backgroundColor: palette.primary,
          gap: spacing.md,
          overflow: 'hidden',
        }}>
        <Text style={{ color: '#DCEEFF', fontSize: 14, fontWeight: '800' }}>One-minute mental math</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 36, lineHeight: 40, fontWeight: '900' }}>Get fast at the arithmetic you actually use.</Text>
        <Text style={{ color: '#EAF4FF', fontSize: 15, lineHeight: 22 }}>
          Timed drills, unlimited practice, best scores, and practical shortcuts. Built for tiny daily sessions.
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          <AppButton title="Start sprint" palette={palette} variant="secondary" onPress={() => router.push({ pathname: '/session', params: { mode: 'mixed', kind: 'timed' } })} />
          <AppButton title="Practice" palette={palette} variant="ghost" onPress={() => router.push('/train')} style={{ borderColor: '#FFFFFF88' }} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <StatCard label="Streak" value={`${stats.streakDays}d`} palette={palette} tone="green" />
        <StatCard label="Accuracy" value={`${totalAccuracy}%`} palette={palette} tone="blue" />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <StatCard label="Solved" value={`${stats.totalCorrect}`} palette={palette} tone="purple" />
        <StatCard label="Rounds" value={`${stats.rounds.length}`} palette={palette} tone="orange" />
      </View>

      {recent ? (
        <View style={{ borderRadius: radii.lg, padding: spacing.md, backgroundColor: palette.surfaceStrong, gap: spacing.xs }}>
          <Text style={{ color: palette.text, fontSize: 16, fontWeight: '900' }}>Last round</Text>
          <Text style={{ color: palette.textMuted, fontSize: 14 }}>
            {recent.correct}/{recent.attempted} correct in {recent.elapsedSeconds}s
          </Text>
        </View>
      ) : null}

      <Text style={{ color: palette.text, fontSize: 20, fontWeight: '900', marginTop: spacing.sm }}>Recommended</Text>
      {PRACTICE_MODES.slice(0, 3).map((mode) => (
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
