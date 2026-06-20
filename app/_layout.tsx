import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getPalette } from '@/constants/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const palette = useMemo(() => getPalette(scheme), [scheme]);
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = useMemo(
    () => ({
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: palette.background,
        card: palette.surface,
        text: palette.text,
        border: palette.border,
        primary: palette.primary,
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
          headerTintColor: palette.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="session" options={{ title: 'Round', headerBackTitle: 'Back' }} />
      </Stack>
    </ThemeProvider>
  );
}
