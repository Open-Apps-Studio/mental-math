import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { getPalette } from '@/constants/theme';
import { useScheme } from '@/lib/settings';

export default function TabsLayout() {
  const palette = getPalette(useScheme());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.separator },
        tabBarActiveTintColor: palette.blue,
        tabBarInactiveTintColor: palette.textFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Tests', tabBarIcon: ({ color, size }) => <Ionicons name="stopwatch-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="trainer"
        options={{ title: 'Trainer', tabBarIcon: ({ color, size }) => <Ionicons name="school-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{ title: 'Knowledge', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
