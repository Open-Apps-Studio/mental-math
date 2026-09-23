import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { Card, GroupLabel, Row } from '@/components/list';
import { ExerciseIcon } from '@/components/exercise-icon';
import { getPalette, radii, spacing } from '@/constants/theme';
import { DIFFICULTIES, Difficulty, ExerciseType, formatSeconds, NumberDomain } from '@/lib/math';
import { useScheme } from '@/lib/settings';
import { startSession } from '@/lib/trainer-store';
import { useStats } from '@/hooks/use-stats';

type Test = {
  statKey: string;
  title: string;
  subtitle: string;
  symbol: string;
  domain: NumberDomain;
  exercises: ExerciseType[];
  seconds: number;
  difficulty: Difficulty;
};

const MIXED: ExerciseType[] = ['add', 'subtract', 'multiply', 'divide'];

const TESTS: Test[] = [
  { statKey: 'test-30', title: '30-second sprint', subtitle: 'All four operations, fast', symbol: '⚡', domain: 'natural', exercises: MIXED, seconds: 30, difficulty: 'medium' },
  { statKey: 'test-120', title: 'Two-minute marathon', subtitle: 'How many can you clear?', symbol: '🏁', domain: 'natural', exercises: MIXED, seconds: 120, difficulty: 'medium' },
  { statKey: 'test-add', title: 'Addition test', subtitle: '60 seconds, addition only', symbol: '+', domain: 'natural', exercises: ['add'], seconds: 60, difficulty: 'medium' },
  { statKey: 'test-times', title: 'Times tables test', subtitle: '60 seconds of multiplication', symbol: '×', domain: 'times', exercises: ['multiply'], seconds: 60, difficulty: 'medium' },
  { statKey: 'test-hard', title: 'Hard mixed test', subtitle: 'Bigger numbers, 60 seconds', symbol: '🔥', domain: 'natural', exercises: MIXED, seconds: 60, difficulty: 'hard' },
];

const DAILY: Test = {
  statKey: 'test-60',
  title: '60-Second Test',
  subtitle: 'Mixed arithmetic',
  symbol: '∑',
  domain: 'natural',
  exercises: MIXED,
  seconds: 60,
  difficulty: 'medium',
};

const ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'superhard'];

/**
 * Difficulty a test runs at for the chosen level. Tests are tuned for medium;
 * the hard test stays one step above whatever is chosen.
 */
function effectiveDifficulty(test: Test, chosen: Difficulty): Difficulty {
  const offset = ORDER.indexOf(test.difficulty) - ORDER.indexOf('medium');
  return ORDER[Math.min(ORDER.length - 1, Math.max(0, ORDER.indexOf(chosen) + offset))];
}

/** Best-score key: unchanged at a test's default level so existing bests carry over. */
function statKeyFor(test: Test, chosen: Difficulty): string {
  const level = effectiveDifficulty(test, chosen);
  return level === test.difficulty ? test.statKey : `${test.statKey}-${level}`;
}

function launch(test: Test, chosen: Difficulty) {
  const level = effectiveDifficulty(test, chosen);
  const difficulty: Record<string, Difficulty> = {};
  test.exercises.forEach((e) => {
    difficulty[e] = level;
  });
  const label = DIFFICULTIES.find((d) => d.id === level)?.label ?? level;
  startSession({
    title: level === test.difficulty ? test.title : `${test.title} · ${label}`,
    statKey: statKeyFor(test, chosen),
    domain: test.domain,
    exercises: test.exercises,
    difficulty,
    kind: 'timed',
    seconds: test.seconds,
  });
  router.push('/session');
}

export default function TestsScreen() {
  const palette = getPalette(useScheme());
  const { stats } = useStats();
  const [level, setLevel] = useState<Difficulty>('medium');
  const best = stats.bestByKey[statKeyFor(DAILY, level)]?.correct ?? 0;

  return (
    <Screen palette={palette} title="Tests">
      <Segmented<Difficulty>
        palette={palette}
        options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))}
        value={level}
        onChange={setLevel}
      />
      <Pressable
        onPress={() => launch(DAILY, level)}
        style={({ pressed }) => ({
          borderRadius: radii.xl,
          backgroundColor: palette.green,
          padding: spacing.lg,
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
          overflow: 'hidden',
        })}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '700' }}>Daily challenge</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800' }}>{DAILY.title}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
          Solve as many mixed problems as you can in {formatSeconds(DAILY.seconds)}.
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill }}>
            <Ionicons name="play" size={15} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>Start</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>Best: {best}</Text>
        </View>
      </Pressable>

      <View>
        <GroupLabel palette={palette}>More tests</GroupLabel>
        <Card palette={palette}>
          {TESTS.map((test, index) => (
            <Row
              key={test.statKey}
              palette={palette}
              label={test.title}
              sublabel={test.subtitle}
              separator={index < TESTS.length - 1}
              onPress={() => launch(test, level)}
              chevron
              left={<ExerciseIcon palette={palette} symbol={test.symbol} />}
              right={
                stats.bestByKey[statKeyFor(test, level)]?.correct ? (
                  <Text style={{ color: palette.textMuted, fontSize: 14, fontWeight: '600' }}>{stats.bestByKey[statKeyFor(test, level)].correct}</Text>
                ) : null
              }
            />
          ))}
        </Card>
      </View>

      <View>
        <GroupLabel palette={palette}>Games</GroupLabel>
        <Card palette={palette}>
          <Row
            palette={palette}
            label="Magic Square"
            sublabel="Make every line add up to the same number"
            separator={false}
            onPress={() => router.push('/magic-square')}
            chevron
            left={<ExerciseIcon palette={palette} symbol="▦" />}
          />
        </Card>
      </View>
    </Screen>
  );
}
