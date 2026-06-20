import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Keypad } from '@/components/keypad';
import { getPalette, radii, spacing } from '@/constants/theme';
import {
  Difficulty,
  ExerciseType,
  formatSeconds,
  generateQuestion,
  getExercise,
  isCorrect,
  Question,
} from '@/lib/math';
import { useScheme, useSettings } from '@/lib/settings';
import { getPendingSession, SessionConfig } from '@/lib/trainer-store';
import { useStats } from '@/hooks/use-stats';

const FALLBACK: SessionConfig = {
  title: '60-Second Test',
  statKey: 'test-60',
  domain: 'natural',
  exercises: ['add', 'subtract', 'multiply', 'divide'],
  difficulty: { add: 'medium', subtract: 'medium', multiply: 'medium', divide: 'medium' },
  kind: 'timed',
  seconds: 60,
};

export default function SessionScreen() {
  const palette = getPalette(useScheme());
  const { haptics } = useSettings();
  const { recordRound } = useStats();
  const config = useMemo(() => getPendingSession() ?? FALLBACK, []);

  const next = useMemo(
    () => () => {
      const exercise = config.exercises[Math.floor(Math.random() * config.exercises.length)] as ExerciseType;
      const difficulty: Difficulty = config.difficulty[exercise] ?? 'medium';
      return generateQuestion(exercise, config.domain, difficulty);
    },
    [config],
  );

  const [question, setQuestion] = useState<Question>(() => next());
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(config.kind === 'timed' ? config.seconds : 0);
  const [isFinished, setIsFinished] = useState(false);
  const [flash, setFlash] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const startedAt = useRef(Date.now());
  const solvedRef = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    solvedRef.current = solved;
  }, [solved]);

  // Countdown timer (paused while the cancel dialog is open).
  useEffect(() => {
    if (config.kind !== 'timed' || isFinished || confirming) return;
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
  }, [isFinished, confirming, config.kind]);

  // Auto-advance: the instant the typed value is correct, score it and move on.
  useEffect(() => {
    if (isFinished || !input) return;
    if (!isCorrect(input, question.answer)) return;
    setSolved((value) => value + 1);
    setFlash(true);
    if (haptics) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    setTimeout(() => setFlash(false), 160);
    setInput('');
    setQuestion(next());
  }, [input, question, isFinished, haptics, next]);

  const appendKey = (key: string) => {
    if (key === '⌫') {
      setInput((value) => value.slice(0, -1));
      return;
    }
    if (key === '.' && input.includes('.')) return;
    setInput((value) => `${value}${key}`.slice(0, 9));
  };

  const finishRound = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const count = solvedRef.current;
    setIsFinished(true);
    void recordRound({
      id: `${Date.now()}`,
      title: config.title,
      key: config.statKey,
      kind: config.kind,
      correct: count,
      attempted: count,
      elapsedSeconds,
      createdAt: new Date().toISOString(),
    });
  };

  const restart = () => {
    setConfirming(false);
    startedAt.current = Date.now();
    setQuestion(next());
    setInput('');
    setSolved(0);
    setSecondsLeft(config.kind === 'timed' ? config.seconds : 0);
    setFlash(false);
    solvedRef.current = 0;
    finishedRef.current = false;
    setIsFinished(false);
  };

  const elapsed = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));

  if (isFinished) {
    return (
      <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Stack.Screen options={{ title: 'Results', headerLeft: () => null }} />
        <View style={{ borderRadius: radii.lg, padding: spacing.xl, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ color: palette.textMuted, fontSize: 14, fontWeight: '700' }}>{config.title}</Text>
          <Text style={{ color: palette.green, fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{solved}</Text>
          <Text style={{ color: palette.textMuted, fontSize: 16 }}>solved</Text>
        </View>
        <Pressable
          onPress={restart}
          style={({ pressed }) => ({ height: 54, borderRadius: radii.pill, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>Play again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ height: 54, borderRadius: radii.pill, backgroundColor: palette.surfaceStrong, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
          <Text style={{ color: palette.text, fontSize: 17, fontWeight: '700' }}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Stack.Screen
        options={{
          title: 'Round',
          headerLeft: () => null,
          gestureEnabled: false,
          headerRight: () => (
            <Ionicons name="close" size={26} color={palette.text} onPress={() => setConfirming(true)} />
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
          <Metric label={config.kind === 'timed' ? 'Time' : 'Elapsed'} value={config.kind === 'timed' ? formatSeconds(secondsLeft) : formatSeconds(elapsed)} palette={palette} />
          <Metric label="Solved" value={`${solved}`} palette={palette} />
        </View>

        <View
          style={{
            borderRadius: radii.lg,
            padding: spacing.xl,
            minHeight: 200,
            backgroundColor: flash ? `${palette.success}22` : palette.surface,
            borderWidth: 1,
            borderColor: flash ? palette.success : palette.border,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
          }}>
          <Text style={{ color: palette.green, fontSize: 14, fontWeight: '700' }}>{getExercise(question.exercise).label}</Text>
          <Text style={{ color: palette.text, fontSize: 46, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{question.prompt}</Text>
        </View>

        <View style={{ borderRadius: radii.lg, padding: spacing.md, backgroundColor: palette.surfaceStrong, minHeight: 64, justifyContent: 'center' }}>
          <Text style={{ color: input ? palette.text : palette.textFaint, fontSize: 30, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
            {input || 'Type answer'}
          </Text>
        </View>

        <Keypad palette={palette} onKey={appendKey} />
      </ScrollView>

      <CancelDialog
        visible={confirming}
        palette={palette}
        onDismiss={() => setConfirming(false)}
        onNewRound={restart}
        onQuit={() => {
          setConfirming(false);
          router.back();
        }}
      />
    </View>
  );
}

function CancelDialog({
  visible,
  palette,
  onDismiss,
  onNewRound,
  onQuit,
}: {
  visible: boolean;
  palette: ReturnType<typeof getPalette>;
  onDismiss: () => void;
  onNewRound: () => void;
  onQuit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        <Pressable
          onPress={() => {}}
          style={{ width: '100%', maxWidth: 340, borderRadius: radii.lg, backgroundColor: palette.surface, padding: spacing.lg, gap: spacing.md }}>
          <Text style={{ color: palette.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>Cancel round?</Text>
          <Text style={{ color: palette.textMuted, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>
            Your progress will be lost. Are you sure you want to cancel the current round?
          </Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
            <DialogButton label="New round" onPress={onNewRound} color={palette.green} filled palette={palette} />
            <DialogButton label="Quit" onPress={onQuit} color={palette.danger} palette={palette} />
            <DialogButton label="Cancel" onPress={onDismiss} color={palette.text} palette={palette} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DialogButton({
  label,
  onPress,
  color,
  filled,
  palette,
}: {
  label: string;
  onPress: () => void;
  color: string;
  filled?: boolean;
  palette: ReturnType<typeof getPalette>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        height: 50,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: filled ? color : palette.surfaceStrong,
        opacity: pressed ? 0.75 : 1,
      })}>
      <Text style={{ color: filled ? '#FFFFFF' : color, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function Metric({ label, value, palette }: { label: string; value: string; palette: ReturnType<typeof getPalette> }) {
  return (
    <View style={{ flex: 1, borderRadius: radii.md, padding: spacing.sm, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
      <Text style={{ color: palette.textFaint, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>{label}</Text>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}
