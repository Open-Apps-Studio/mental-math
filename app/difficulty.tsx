import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Card, GroupLabel, Row, SectionTitle } from '@/components/list';
import { DifficultyBars } from '@/components/difficulty-bars';
import { getPalette, radii, spacing } from '@/constants/theme';
import { getDomain } from '@/data/domains';
import { DIFFICULTIES, Difficulty, ExerciseType, generateQuestion, Question } from '@/lib/math';
import { useScheme } from '@/lib/settings';
import { setDifficulty, useSelection } from '@/lib/trainer-store';

export default function DifficultyScreen() {
  const palette = getPalette(useScheme());
  const { exercise, domain: domainId } = useLocalSearchParams<{ exercise: ExerciseType; domain: string }>();
  const domain = getDomain(domainId);
  // Read from the reactive selection so the checkmark tracks store changes
  // (the React Compiler can't see module-level reads as dependencies).
  const selection = useSelection();
  const current: Difficulty = selection.difficulty[exercise] ?? 'medium';
  const [example, setExample] = useState<Question | null>(null);

  const roll = useCallback(() => {
    setExample(generateQuestion(exercise, domain.id, current));
  }, [exercise, domain.id, current]);

  useEffect(() => {
    roll();
  }, [roll, current]);

  const choose = (id: Difficulty) => setDifficulty(exercise, id);

  return (
    <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}>
      <Stack.Screen options={{ title: 'Difficulty' }} />

      <Card palette={palette}>
        {DIFFICULTIES.map((diff, index) => (
          <Row
            key={diff.id}
            palette={palette}
            label={diff.label}
            onPress={() => choose(diff.id)}
            separator={index < DIFFICULTIES.length - 1}
            left={<DifficultyBars palette={palette} level={diff.level} size="md" />}
            right={current === diff.id ? <Ionicons name="checkmark" size={20} color={palette.blue} /> : null}
          />
        ))}
      </Card>
      <Text style={{ color: palette.textMuted, fontSize: 13, marginHorizontal: spacing.xs, marginBottom: spacing.sm }}>
        Choose a difficulty level.
      </Text>

      <SectionTitle palette={palette}>Example</SectionTitle>
      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.border,
          padding: spacing.lg,
          alignItems: 'center',
          gap: spacing.xs,
        }}>
        <Pressable onPress={roll} hitSlop={12} style={{ position: 'absolute', top: spacing.md, right: spacing.md }}>
          <Ionicons name="refresh" size={20} color={palette.blue} />
        </Pressable>
        <Text style={{ color: palette.text, fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
          {example?.prompt ?? '—'}
        </Text>
        <Text style={{ color: palette.textMuted, fontSize: 15 }}>Result: {example?.displayAnswer ?? '—'}</Text>
      </View>
    </ScrollView>
  );
}
