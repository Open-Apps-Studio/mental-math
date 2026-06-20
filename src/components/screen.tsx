import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, spacing } from '@/constants/theme';

type Props = {
  palette: Palette;
  /** Large bold left-aligned title (iOS large-title style). */
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

// Scrolling tab screen with a large left-aligned title, matching the
// Trainer / Knowledge / Progress / Settings headers.
export function Screen({ palette, title, headerRight, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.xs,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.md,
        gap: spacing.md,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.sm, marginBottom: spacing.xs }}>
        <Text style={{ color: palette.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 }}>{title}</Text>
        {headerRight}
      </View>
      {children}
    </ScrollView>
  );
}
