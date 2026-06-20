import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native';
import { AppButton } from '@/components/app-button';
import { Keypad } from '@/components/keypad';
import { getPalette, radii, spacing } from '@/constants/theme';
import { formatSeconds, generateQuestion, getPracticeMode, isCorrect, Question, RoundKind } from '@/lib/math';
import { useStats } from '@/hooks/use-stats';

const ROUND_SECONDS = 60;

export default function SessionScreen() {
  const params = useLocalSearchParams<{ mode?: string; kind?: RoundKind }>();
  const palette = getPalette(useColorScheme());
  const mode = useMemo(() => getPracticeMode(params.mode), [params.mode]);
  const kind: RoundKind = params.kind === 'unlimited' ? 'unlimited' : 'timed';
  const { recordRound } = useStats();
  const [question, setQuestion] = useState<Question>(() => generateQuestion(mode.id, mode.difficulty));
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(kind === 'timed' ? ROUND_SECONDS : 0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const startedAt = useRef(Date.now());
  const scoreRef = useRef({ correct: 0, attempted: 0 });
  const finishedRef = useRef(false);

  useEffect(() => {
    scoreRef.current = { correct, attempted };
  }, [attempted, correct]);

  useEffect(() => {
    if (kind !== 'timed' || isFinished) return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          finishRound();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, kind]);

  const appendKey = (key: string) => {
    if (key === '⌫') {
      setInput((value) => value.slice(0, -1));
      return;
    }
    if (key === '.' && input.includes('.')) return;
    setInput((value) => `${value}${key}`.slice(0, 8));
  };

  const submit = () => {
    if (isFinished) return;
    const ok = isCorrect(input, question.answer);
    setAttempted((value) => value + 1);
    setCorrect((value) => value + (ok ? 1 : 0));
    setFeedback(ok ? 'correct' : 'wrong');
    void Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    setTimeout(() => setFeedback(null), 220);
    setInput('');
    setQuestion(generateQuestion(mode.id, mode.difficulty));
  };

  const finishRound = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const finalScore = scoreRef.current;
    setIsFinished(true);
    void recordRound({
      id: `${Date.now()}`,
      mode: mode.id,
      kind,
      correct: finalScore.correct,
      attempted: finalScore.attempted,
      elapsedSeconds,
      createdAt: new Date().toISOString(),
    });
  };

  const restart = () => {
    startedAt.current = Date.now();
    setQuestion(generateQuestion(mode.id, mode.difficulty));
    setInput('');
    setCorrect(0);
    setAttempted(0);
    setSecondsLeft(kind === 'timed' ? ROUND_SECONDS : 0);
    setFeedback(null);
    scoreRef.current = { correct: 0, attempted: 0 };
    finishedRef.current = false;
    setIsFinished(false);
  };

  const elapsed = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
  const accuracy = attempted === 0 ? 0 : Math.round((correct / attempted) * 100);

  if (isFinished) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <View style={{ borderRadius: radii.lg, padding: spacing.lg, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, gap: spacing.md }}>
          <Text style={{ color: palette.textMuted, fontSize: 14, fontWeight: '800' }}>{mode.title} complete</Text>
          <Text style={{ color: palette.text, fontSize: 42, fontWeight: '900', fontVariant: ['tabular-nums'] }}>{correct}</Text>
          <Text style={{ color: palette.textMuted, fontSize: 16 }}>correct answers • {accuracy}% accuracy</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <AppButton title="Again" palette={palette} onPress={restart} />
            <AppButton title="Choose drill" palette={palette} variant="secondary" onPress={() => router.replace('/train')} />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
        <Metric label={kind === 'timed' ? 'Time' : 'Elapsed'} value={kind === 'timed' ? formatSeconds(secondsLeft) : formatSeconds(elapsed)} palette={palette} />
        <Metric label="Score" value={`${correct}/${attempted}`} palette={palette} />
        <Metric label="Accuracy" value={`${accuracy}%`} palette={palette} />
      </View>

      <View
        style={{
          borderRadius: radii.lg,
          padding: spacing.xl,
          minHeight: 235,
          backgroundColor: feedback === 'correct' ? `${palette.success}22` : feedback === 'wrong' ? `${palette.danger}22` : palette.surface,
          borderWidth: 1,
          borderColor: feedback === 'correct' ? palette.success : feedback === 'wrong' ? palette.danger : palette.border,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
        }}>
        <Text style={{ color: palette[mode.accent], fontSize: 16, fontWeight: '900' }}>{mode.title}</Text>
        <Text style={{ color: palette.text, fontSize: 54, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{question.prompt}</Text>
        <Text style={{ color: palette.textMuted, fontSize: 14 }}>Answer as fast as you can</Text>
      </View>

      <View style={{ borderRadius: radii.lg, padding: spacing.md, backgroundColor: palette.surfaceStrong, minHeight: 68, justifyContent: 'center' }}>
        <Text style={{ color: input ? palette.text : palette.textFaint, fontSize: 32, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
          {input || 'Type answer'}
        </Text>
      </View>

      <Keypad palette={palette} onKey={appendKey} onSubmit={submit} />

      <Pressable onPress={finishRound} style={{ alignSelf: 'center', padding: spacing.md }}>
        <Text style={{ color: palette.textMuted, fontWeight: '800' }}>End round</Text>
      </Pressable>
    </ScrollView>
  );
}

function Metric({ label, value, palette }: { label: string; value: string; palette: ReturnType<typeof getPalette> }) {
  return (
    <View style={{ flex: 1, borderRadius: radii.md, padding: spacing.sm, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
      <Text style={{ color: palette.textFaint, fontSize: 12, fontWeight: '800', textAlign: 'center' }}>{label}</Text>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}
