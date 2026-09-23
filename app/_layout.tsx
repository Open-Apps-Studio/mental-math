import { AppState } from 'react-native';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { getPalette } from '@/constants/theme';
import { hydrateFavorites } from '@/lib/favorites';
import { hydrateSettings, useScheme } from '@/lib/settings';
import { hydrateStats } from '@/lib/stats';

export default function RootLayout() {
  const scheme = useScheme();
  const palette = useMemo(() => getPalette(scheme), [scheme]);
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  useEffect(() => {
    void hydrateSettings();
    void hydrateFavorites();
    void hydrateStats();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void hydrateStats();
      }
    });
    return () => sub.remove();
  }, []);

  const theme = useMemo(
    () => ({
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: palette.background,
        card: palette.surface,
        text: palette.text,
        border: palette.separator,
        primary: palette.blue,
      },
    }),
    [baseTheme, palette],
  );

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.blue,
          headerTitleStyle: { color: palette.text, fontWeight: '700' },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: palette.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="exercises/[domain]" getId={({ params }) => params?.domain} />
        <Stack.Screen name="difficulty" options={{ title: 'Difficulty' }} />
        <Stack.Screen name="tricks/[category]" getId={({ params }) => params?.category} />
        <Stack.Screen name="trick" />
        <Stack.Screen name="session" options={{ title: 'Round' }} />
      </Stack>
    </ThemeProvider>
  );
}
