import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getPalette } from '@/constants/theme';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const palette = useMemo(() => getPalette(scheme), [scheme]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerShadowVisible: false,
        headerTintColor: palette.text,
        sceneStyle: { backgroundColor: palette.background },
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textFaint,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Ionicons name="flash-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="train" options={{ title: 'Train', tabBarIcon: ({ color, size }) => <Ionicons name="calculator-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="tips" options={{ title: 'Tips', tabBarIcon: ({ color, size }) => <Ionicons name="bulb-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
