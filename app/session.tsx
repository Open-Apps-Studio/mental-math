import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Keypad } from '@/components/keypad';
import { Card, GroupLabel, Row } from '@/components/list';
import { trickDrill } from '@/lib/trick-drills';
import { getPalette, radii, spacing } from '@/constants/theme';
import {
  Difficulty,
  ExerciseType,
  formatSeconds,
  generateQuestion,
  getExercise,
  isCorrect,
  nextQuestion,
  Question,
} from '@/lib/math';
import { useScheme, useSettings } from '@/lib/settings';
import { accuracy, getStats } from '@/lib/stats';
import { getPendingSession, SessionConfig } from '@/lib/trainer-store';
import { useStats } from '@/hooks/use-stats';

// Keeps the keypad a sensible size on iPad.
const MAX_WIDTH = 560;

const FALLBACK: SessionConfig = {
  title: '60-Second Test',
  statKey: 'test-60',
  domain: 'natural',
  exercises: ['add', 'subtract', 'multiply', 'divide'],
  difficulty: { add: 'medium', subtract: 'medium', multiply: 'medium', divide: 'medium' },
  kind: 'timed',
  seconds: 60,
};

type MissedQuestion = { prompt: string; answer: string };

type RoundSummary = {
  solved: number;
  attempted: number;
  elapsedSeconds: number;
  isNewBest: boolean;
};

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // Short phones: tighten up so the bottom keypad row doesn't need scrolling.
  const compact = height < 700;
  const palette = getPalette(useScheme());
  const { haptics } = useSettings();
  const { recordRound } = useStats();
  const config = useMemo(() => getPendingSession() ?? FALLBACK, []);

  const next = useMemo(
    () => (previousPrompt?: string) =>
      nextQuestion(() => {
        const drill = trickDrill(config.trickId);
        if (drill) return drill();
        const exercises = config.exercises.length > 0 ? config.exercises : FALLBACK.exercises;
        const exercise = exercises[Math.floor(Math.random() * exercises.length)] as ExerciseType;
        const difficulty: Difficulty = config.difficulty[exercise] ?? 'medium';
        return generateQuestion(exercise, config.domain, difficulty);
      }, previousPrompt),
    [config],
  );

  const [question, setQuestion] = useState<Question>(() => next());
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(config.kind === 'timed' ? config.seconds : 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [summary, setSummary] = useState<RoundSummary | null>(null);
  const [missed, setMissed] = useState<MissedQuestion[]>([]);
  /** The last skipped question, shown with its answer until the next correct one. */
  const [revealed, setRevealed] = useState<MissedQuestion | null>(null);
  const [flash, setFlash] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const startedAt = useRef(Date.now());
  const pausedTotalMs = useRef(0);
  const pauseStart = useRef<number | null>(null);
  const solvedRef = useRef(0);
  const skippedRef = useRef(0);
  const finishedRef = useRef(false);
  const isFinished = summary !== null;

  useEffect(() => {
    solvedRef.current = solved;
  }, [solved]);

  const getEffectiveElapsedMs = useCallback(() => {
    const now = Date.now();
    let paused = pausedTotalMs.current;
    if (pauseStart.current !== null) {
      paused += now - pauseStart.current;
    }
    return Math.max(0, now - startedAt.current - paused);
  }, []);

  const finishRound = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const effectiveElapsed = Math.max(1, Math.round(getEffectiveElapsedMs() / 1000));
    const finalElapsed = config.kind === 'timed' ? Math.min(config.seconds, effectiveElapsed) : effectiveElapsed;
    const count = solvedRef.current;
    const attempted = count + skippedRef.current;
    const previousBest = getStats().bestByKey[config.statKey]?.correct;
    setSummary({
      solved: count,
      attempted,
      elapsedSeconds: finalElapsed,
      isNewBest: previousBest !== undefined && count > previousBest,
    });
    // A round nobody played shouldn't land in the history or keep a streak alive.
    if (attempted === 0) return;
    void recordRound({
      id: `${Date.now()}`,
      title: config.title,
      key: config.statKey,
      kind: config.kind,
      correct: count,
      attempted,
      elapsedSeconds: finalElapsed,
      createdAt: new Date().toISOString(),
    });
  }, [config, getEffectiveElapsedMs, recordRound]);

  const openConfirm = () => {
    pauseStart.current = Date.now();
    setConfirming(true);
  };

  const closeConfirm = () => {
    if (pauseStart.current !== null) {
      pausedTotalMs.current += Date.now() - pauseStart.current;
      pauseStart.current = null;
    }
    setConfirming(false);
  };

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, []);

  // Timer loop for both timed countdown and untimed elapsed time.
  useEffect(() => {
    if (isFinished || confirming) return;

    const tick = () => {
      const elapsedMs = getEffectiveElapsedMs();
      if (config.kind === 'timed') {
        const remaining = Math.max(0, Math.ceil((config.seconds * 1000 - elapsedMs) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          finishRound();
        }
      } else {
        setElapsedSeconds(Math.max(1, Math.floor(elapsedMs / 1000)));
      }
    };

    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [isFinished, confirming, config.kind, config.seconds, getEffectiveElapsedMs, finishRound]);

  // AppState listener: update timer immediately on app resume from background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && !finishedRef.current && !confirming) {
        const elapsedMs = getEffectiveElapsedMs();
        if (config.kind === 'timed') {
          const remaining = Math.max(0, Math.ceil((config.seconds * 1000 - elapsedMs) / 1000));
          setSecondsLeft(remaining);
          if (remaining <= 0) {
            finishRound();
          }
        } else {
          setElapsedSeconds(Math.max(1, Math.floor(elapsedMs / 1000)));
        }
      }
    });
    return () => sub.remove();
  }, [confirming, config.kind, config.seconds, finishRound, getEffectiveElapsedMs]);

  // Auto-advance: the instant the typed value is correct, score it and move on.
  useEffect(() => {
    if (isFinished || !input) return;
    if (!isCorrect(input, question.answer)) return;
    const nextSolved = solvedRef.current + 1;
    solvedRef.current = nextSolved;
    setSolved(nextSolved);
    setFlash(true);
    setRevealed(null);
    if (haptics) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setFlash(false), 160);
    setInput('');
    setQuestion(next(question.prompt));
  }, [input, question, isFinished, haptics, next]);

  const appendKey = (key: string) => {
    if (key === '⌫') {
      setInput((value) => value.slice(0, -1));
      return;
    }
    if (key === '0' && input === '0') return;
    if ((key === '.' || key === ',') && (input.includes('.') || input.includes(','))) return;
    if (key === '-' && (input.length > 0 || input.includes('-'))) return;
    setInput((value) => `${value}${key}`.slice(0, 9));
  };

  // Answers only count when correct, so this is the one way past a question
  // the player can't solve, and the only thing that can lower their accuracy.
  const skip = () => {
    const entry = { prompt: question.prompt, answer: question.displayAnswer };
    skippedRef.current += 1;
    setMissed((list) => [...list, entry]);
    setRevealed(entry);
    if (haptics) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    setInput('');
    setQuestion(next(question.prompt));
  };

  const restart = () => {
    startedAt.current = Date.now();
    pausedTotalMs.current = 0;
    pauseStart.current = null;
    setConfirming(false);
    setQuestion(next(question.prompt));
    setInput('');
    setSolved(0);
    setMissed([]);
    setRevealed(null);
    setSecondsLeft(config.kind === 'timed' ? config.seconds : 0);
    setElapsedSeconds(0);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    setFlash(false);
    solvedRef.current = 0;
    skippedRef.current = 0;
    finishedRef.current = false;
    setSummary(null);
  };

  if (summary) {
    const pace = summary.solved > 0 ? `${(summary.elapsedSeconds / summary.solved).toFixed(1)}s` : '—';
    return (
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <Stack.Screen options={{ title: 'Results', headerLeft: () => null, headerRight: () => null }} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', padding: spacing.md, gap: spacing.md }}>
          <View style={{ borderRadius: radii.lg, padding: spacing.xl, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, alignItems: 'center', gap: spacing.sm }}>
            <Text style={{ color: palette.textMuted, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>{config.title}</Text>
            <Text style={{ color: palette.green, fontSize: 64, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{summary.solved}</Text>
            <Text style={{ color: palette.textMuted, fontSize: 16 }}>solved</Text>
            {summary.isNewBest ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="trophy" size={18} color={palette.warning} />
                <Text style={{ color: palette.text, fontSize: 16, fontWeight: '700' }}>New best!</Text>
              </View>
            ) : null}
            {summary.attempted === 0 ? (
              <Text style={{ color: palette.textMuted, fontSize: 14, textAlign: 'center' }}>
                Nothing answered, so this round wasn't saved.
              </Text>
            ) : null}
          </View>

          {summary.attempted > 0 ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Metric label="Accuracy" value={`${accuracy(summary.solved, summary.attempted)}%`} palette={palette} />
              <Metric label="Per answer" value={pace} palette={palette} />
              <Metric label="Skipped" value={`${missed.length}`} palette={palette} />
            </View>
          ) : null}

          {missed.length > 0 ? (
            <View>
              <GroupLabel palette={palette}>Review what you skipped</GroupLabel>
              <Card palette={palette}>
                {missed.map((item, index) => (
                  <Row
                    key={index}
                    palette={palette}
                    label={item.prompt}
                    separator={index < missed.length - 1}
                    right={<Text style={{ color: palette.text, fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{item.answer}</Text>}
                  />
                ))}
              </Card>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            width: '100%',
            maxWidth: MAX_WIDTH,
            alignSelf: 'center',
            paddingHorizontal: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: Math.max(spacing.md, insets.bottom + spacing.sm),
          }}>
          <Pressable
            onPress={leave}
            accessibilityRole="button"
            accessibilityLabel="Done"
            style={({ pressed }) => ({ flex: 1, height: 54, borderRadius: radii.pill, backgroundColor: palette.surfaceStrong, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: palette.text, fontSize: 17, fontWeight: '700' }}>Done</Text>
          </Pressable>
          <Pressable
            onPress={restart}
            accessibilityRole="button"
            accessibilityLabel="Play again"
            style={({ pressed }) => ({ flex: 1, height: 54, borderRadius: radii.pill, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>Play again</Text>
          </Pressable>
        </View>
      </View>
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
            <Pressable
              onPress={openConfirm}
              hitSlop={10}
              accessibilityLabel="Cancel round"
              accessibilityRole="button">
              <Ionicons name="close" size={26} color={palette.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: MAX_WIDTH,
          alignSelf: 'center',
          padding: spacing.md,
          paddingBottom: Math.max(spacing.md, insets.bottom + spacing.sm),
          gap: compact ? spacing.sm : spacing.md,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
          <Metric label={config.kind === 'timed' ? 'Time' : 'Elapsed'} value={config.kind === 'timed' ? formatSeconds(secondsLeft) : formatSeconds(elapsedSeconds)} palette={palette} />
          <Metric label="Solved" value={`${solved}`} palette={palette} />
        </View>

        <View
          style={{
            flex: 1,
            borderRadius: radii.lg,
            padding: compact ? spacing.md : spacing.xl,
            minHeight: compact ? 104 : 180,
            backgroundColor: flash ? `${palette.success}22` : palette.surface,
            borderWidth: 1,
            borderColor: flash ? palette.success : palette.border,
            alignItems: 'center',
            justifyContent: 'center',
            gap: compact ? spacing.xs : spacing.md,
          }}>
          <Text style={{ color: palette.green, fontSize: 14, fontWeight: '700' }}>{getExercise(question.exercise).label}</Text>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            style={{ color: palette.text, fontSize: compact ? 38 : 46, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
            {question.prompt}
          </Text>
          {revealed ? (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.xs, color: palette.textMuted, fontSize: 14, fontWeight: '600', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
              Skipped: {revealed.prompt} = {revealed.answer}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1, borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: palette.surfaceStrong, minHeight: compact ? 52 : 64, justifyContent: 'center' }}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ color: input ? palette.text : palette.textFaint, fontSize: compact ? 26 : 30, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
              {input || 'Type answer'}
            </Text>
          </View>
          <Pressable
            onPress={skip}
            accessibilityRole="button"
            accessibilityLabel="Skip question"
            style={({ pressed }) => ({
              width: 76,
              borderRadius: radii.lg,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              opacity: pressed ? 0.6 : 1,
            })}>
            <Ionicons name="play-skip-forward" size={18} color={palette.textMuted} />
            <Text style={{ color: palette.textMuted, fontSize: 13, fontWeight: '700' }}>Skip</Text>
          </Pressable>
        </View>

        <Keypad palette={palette} onKey={appendKey} keyHeight={compact ? 54 : 62} />
      </ScrollView>

      <CancelDialog
        visible={confirming}
        palette={palette}
        onDismiss={closeConfirm}
        onNewRound={restart}
        onQuit={() => {
          closeConfirm();
          leave();
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
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
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
      accessibilityRole="button"
      accessibilityLabel={label}
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
    <View
      accessible={true}
      accessibilityLabel={`${label}: ${value}`}
      style={{ flex: 1, borderRadius: radii.md, padding: spacing.sm, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
      <Text style={{ color: palette.textFaint, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: palette.text, fontSize: 18, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}
