import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Segmented } from '@/components/segmented';
import { getPalette, radii, spacing } from '@/constants/theme';
import { generateMagicSquare, LINES, lineSum, type MagicPuzzle } from '@/lib/magic-square';
import { DIFFICULTIES, formatSeconds, type Difficulty } from '@/lib/math';
import { useScheme, useSettings } from '@/lib/settings';

const BEST_KEY = 'magic-square-best-v1';

export default function MagicSquareScreen() {
  const palette = getPalette(useScheme());
  const { haptics } = useSettings();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<MagicPuzzle>(() => generateMagicSquare('easy'));
  const [cells, setCells] = useState<(number | null)[]>(puzzle.givens);
  const [selected, setSelected] = useState<number | null>(() => puzzle.givens.findIndex((g) => g === null));
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<Record<string, number>>({});

  const solved = cells.every((c) => c !== null) && LINES.every((line) => lineSum(cells, line) === puzzle.target);

  useEffect(() => {
    AsyncStorage.getItem(BEST_KEY)
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && typeof parsed === 'object') setBest(parsed);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (solved) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(id);
  }, [solved, startedAt]);

  const newPuzzle = (level: Difficulty) => {
    const next = generateMagicSquare(level);
    setPuzzle(next);
    setCells(next.givens);
    setSelected(next.givens.findIndex((g) => g === null));
    setStartedAt(Date.now());
    setElapsed(0);
  };

  const place = (value: number) => {
    if (selected === null || puzzle.givens[selected] !== null || solved) return;
    const next = [...cells];
    next[selected] = value;
    setCells(next);
    // Jump to the next empty cell so filling the grid is quick.
    const after = next.findIndex((c, i) => c === null && i > selected);
    setSelected(after >= 0 ? after : next.findIndex((c) => c === null));
    const done = next.every((c) => c !== null) && LINES.every((line) => lineSum(next, line) === puzzle.target);
    if (done) {
      const seconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
      setElapsed(seconds);
      if (haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (!best[difficulty] || seconds < best[difficulty]) {
        const updated = { ...best, [difficulty]: seconds };
        setBest(updated);
        AsyncStorage.setItem(BEST_KEY, JSON.stringify(updated)).catch(() => {});
      }
    }
  };

  const tapCell = (index: number) => {
    if (puzzle.givens[index] !== null || solved) return;
    if (selected === index && cells[index] !== null) {
      // Second tap on a filled cell clears it.
      const next = [...cells];
      next[index] = null;
      setCells(next);
      return;
    }
    setSelected(index);
  };

  const used = new Set(cells.filter((c): c is number => c !== null));
  const sumColor = (sum: number | null) => (sum === null ? palette.textFaint : sum === puzzle.target ? palette.green : palette.danger);
  const rows = [LINES[0], LINES[1], LINES[2]];
  const cols = [LINES[3], LINES[4], LINES[5]];
  const cellSize = 84;

  return (
    <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
      <Stack.Screen options={{ title: 'Magic Square' }} />
      <Segmented<Difficulty>
        palette={palette}
        options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.label }))}
        value={difficulty}
        onChange={(level) => {
          setDifficulty(level);
          newPuzzle(level);
        }}
      />

      <View style={{ gap: 4 }}>
        <Text style={{ color: palette.text, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
          Make every row, column and diagonal add up to {puzzle.target}
        </Text>
        <Text style={{ color: palette.textMuted, fontSize: 14, textAlign: 'center' }}>
          Use each number once · {formatSeconds(elapsed)}
          {best[difficulty] ? ` · Best ${formatSeconds(best[difficulty])}` : ''}
        </Text>
      </View>

      <View style={{ alignSelf: 'center', gap: 6 }}>
        {rows.map((line, r) => (
          <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {line.map((index) => {
              const given = puzzle.givens[index] !== null;
              const isSelected = selected === index && !solved;
              return (
                <Pressable
                  key={index}
                  onPress={() => tapCell(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Row ${r + 1}, column ${(index % 3) + 1}, ${cells[index] ?? 'empty'}${given ? ', given' : ''}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: radii.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: solved ? palette.greenSoft : given ? palette.surfaceStrong : palette.surface,
                    borderWidth: isSelected ? 3 : 1,
                    borderColor: isSelected ? palette.blue : palette.border,
                  }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: given ? '800' : '600',
                      color: given ? palette.text : palette.blue,
                      fontVariant: ['tabular-nums'],
                    }}>
                    {cells[index] ?? ''}
                  </Text>
                </Pressable>
              );
            })}
            <Text style={{ width: 36, textAlign: 'center', fontWeight: '800', color: sumColor(lineSum(cells, line)), fontVariant: ['tabular-nums'] }}>
              {lineSum(cells, line) ?? '·'}
            </Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {cols.map((line, c) => (
            <Text key={c} style={{ width: cellSize, textAlign: 'center', fontWeight: '800', color: sumColor(lineSum(cells, line)), fontVariant: ['tabular-nums'] }}>
              {lineSum(cells, line) ?? '·'}
            </Text>
          ))}
        </View>
      </View>

      {solved ? (
        <View style={{ gap: spacing.md, alignItems: 'center' }}>
          <Text style={{ color: palette.green, fontSize: 22, fontWeight: '800' }}>Solved in {formatSeconds(elapsed)}!</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => newPuzzle(difficulty)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: palette.green,
              borderRadius: radii.pill,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              opacity: pressed ? 0.85 : 1,
            })}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800' }}>New puzzle</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm }}>
          {puzzle.numbers.map((n) => {
            const isUsed = used.has(n);
            return (
              <Pressable
                key={n}
                disabled={isUsed}
                onPress={() => place(n)}
                accessibilityRole="button"
                accessibilityLabel={`Place ${n}`}
                accessibilityState={{ disabled: isUsed }}
                style={({ pressed }) => ({
                  minWidth: 56,
                  height: 52,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radii.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  opacity: isUsed ? 0.3 : pressed ? 0.6 : 1,
                })}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: palette.text, fontVariant: ['tabular-nums'] }}>{n}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={{ color: palette.textMuted, fontSize: 13, textAlign: 'center' }}>
        Tap a blank square, then a number. Tap a filled square twice to clear it. Sums turn green when they hit {puzzle.target}.
      </Text>
    </ScrollView>
  );
}
