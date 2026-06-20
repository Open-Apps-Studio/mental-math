import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, GroupLabel } from '@/components/list';
import { DifficultyBars } from '@/components/difficulty-bars';
import { ExerciseIcon } from '@/components/exercise-icon';
import { getPalette, radii, spacing } from '@/constants/theme';
import { getDomain } from '@/data/domains';
import { Difficulty, difficultyLevel, EXERCISES, ExerciseType } from '@/lib/math';
import { useScheme } from '@/lib/settings';
import { difficultyFor, openDomain, startSession, toggleExercise, useSelection } from '@/lib/trainer-store';

export default function ExerciseSelectScreen() {
  const palette = getPalette(useScheme());
  const insets = useSafeAreaInsets();
  const { domain: domainId } = useLocalSearchParams<{ domain: string }>();
  const domain = getDomain(domainId);
  const selection = useSelection();

  useEffect(() => {
    openDomain(domain.id);
  }, [domain.id]);

  const exercises = EXERCISES.filter((e) => domain.exercises.includes(e.id));
  const selected = selection.domain === domain.id ? selection.selected : [];

  const launch = () => {
    if (selected.length === 0) return;
    const difficulty: Record<string, Difficulty> = {};
    selected.forEach((id) => {
      difficulty[id] = difficultyFor(id);
    });
    const labels = selected.map((id) => EXERCISES.find((e) => e.id === id)?.label).filter(Boolean);
    startSession({
      title: `${domain.title} · ${labels.join(', ')}`,
      statKey: domain.id,
      domain: domain.id,
      exercises: selected as ExerciseType[],
      difficulty,
      kind: 'timed',
      seconds: 60,
    });
    router.push('/session');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Stack.Screen options={{ title: domain.title }} />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 140, gap: spacing.sm }}>
        <GroupLabel palette={palette}>Exercise types</GroupLabel>
        <Card palette={palette}>
          {exercises.map((exercise, index) => {
            const isSelected = selected.includes(exercise.id);
            const last = index === exercises.length - 1;
            return (
              <Pressable
                key={exercise.id}
                onPress={() => toggleExercise(exercise.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  paddingHorizontal: spacing.md,
                  minHeight: 54,
                  borderBottomWidth: last ? 0 : 0.5,
                  borderBottomColor: palette.separator,
                  backgroundColor: isSelected ? palette.greenSoft : 'transparent',
                  opacity: pressed ? 0.6 : 1,
                })}>
                <ExerciseIcon palette={palette} symbol={exercise.symbol} />
                <Text style={{ flex: 1, color: palette.text, fontSize: 17, fontWeight: '500' }}>{exercise.label}</Text>

                {isSelected ? <Ionicons name="checkmark-circle" size={20} color={palette.green} /> : null}
                <Pressable
                  onPress={() => router.push({ pathname: '/difficulty', params: { exercise: exercise.id, domain: domain.id } })}
                  hitSlop={10}
                  style={{ paddingHorizontal: 4, paddingVertical: 8 }}>
                  <DifficultyBars palette={palette} level={difficultyLevel(selection.difficulty[exercise.id] ?? 'medium')} size="md" color={isSelected ? palette.green : palette.textMuted} />
                </Pressable>
                <Ionicons name="chevron-forward" size={16} color={palette.textFaint} />
              </Pressable>
            );
          })}
        </Card>
        <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 18, marginHorizontal: spacing.xs, marginTop: spacing.xs }}>
          Tap one or more exercises to select them, then tap the bars to set each difficulty.
        </Text>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          backgroundColor: palette.surface,
          borderTopWidth: 0.5,
          borderTopColor: palette.separator,
        }}>
        <Pressable
          onPress={launch}
          disabled={selected.length === 0}
          style={({ pressed }) => ({
            height: 54,
            borderRadius: radii.pill,
            backgroundColor: selected.length === 0 ? palette.surfaceStrong : palette.green,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
          })}>
          <Text style={{ color: selected.length === 0 ? palette.textFaint : '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 }}>
            START
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
