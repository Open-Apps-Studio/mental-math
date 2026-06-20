import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Card, GroupLabel, Row } from '@/components/list';
import { ExerciseIcon } from '@/components/exercise-icon';
import { getPalette, radii, spacing } from '@/constants/theme';
import { Difficulty, ExerciseType, formatSeconds, NumberDomain } from '@/lib/math';
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

function launch(test: Test) {
  const difficulty: Record<string, Difficulty> = {};
  test.exercises.forEach((e) => {
    difficulty[e] = test.difficulty;
  });
  startSession({
    title: test.title,
    statKey: test.statKey,
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
  const best = stats.bestByKey[DAILY.statKey]?.correct ?? 0;

  return (
    <Screen palette={palette} title="Tests">
      <Pressable
        onPress={() => launch(DAILY)}
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
              onPress={() => launch(test)}
              chevron
              left={<ExerciseIcon palette={palette} symbol={test.symbol} />}
              right={
                stats.bestByKey[test.statKey]?.correct ? (
                  <Text style={{ color: palette.textMuted, fontSize: 14, fontWeight: '600' }}>{stats.bestByKey[test.statKey].correct}</Text>
                ) : null
              }
            />
          ))}
        </Card>
      </View>
    </Screen>
  );
}
