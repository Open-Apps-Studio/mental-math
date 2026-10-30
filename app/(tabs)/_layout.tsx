import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPalette } from '@/constants/theme';
import { useScheme } from '@/lib/settings';

export default function TabsLayout() {
  const palette = getPalette(useScheme());
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        // The default 49pt leaves the label 10pt of height, which clips it. A custom
        // height replaces the default one, bottom inset included.
        tabBarStyle: { height: 56 + insets.bottom, backgroundColor: palette.surface, borderTopColor: palette.separator },
        tabBarActiveTintColor: palette.blue,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Tests', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'stopwatch' : 'stopwatch-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="trainer"
        options={{ title: 'Trainer', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'school' : 'school-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{ title: 'Knowledge', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'book' : 'book-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={size} /> }}
      />
    </Tabs>
  );
}
