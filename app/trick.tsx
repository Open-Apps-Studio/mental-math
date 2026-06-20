import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Card, GroupLabel } from '@/components/list';
import { getPalette, radii, spacing } from '@/constants/theme';
import { getTrick } from '@/data/knowledge';
import { toggleFavorite, useFavorites } from '@/lib/favorites';
import { useScheme } from '@/lib/settings';

export default function TrickScreen() {
  const palette = getPalette(useScheme());
  const { category, id } = useLocalSearchParams<{ category: string; id: string }>();
  const favorites = useFavorites();
  const trick = getTrick(category, id);
  const isFavorite = id ? favorites.has(id) : false;

  if (!trick) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ title: 'Trick' }} />
        <Text style={{ color: palette.textMuted }}>Trick not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <Stack.Screen
        options={{
          title: trick.title,
          headerRight: () => (
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={22}
              color={isFavorite ? palette.warning : palette.blue}
              onPress={() => toggleFavorite(trick.id)}
            />
          ),
        }}
      />

      <View
        style={{
          borderRadius: radii.lg,
          backgroundColor: palette.greenSoft,
          padding: spacing.lg,
          gap: spacing.xs,
        }}>
        <Text style={{ color: palette.text, fontSize: 20, fontWeight: '800' }}>{trick.title}</Text>
        <Text style={{ color: palette.textMuted, fontSize: 15, lineHeight: 21 }}>{trick.summary}</Text>
      </View>

      <View>
        <GroupLabel palette={palette}>How it works</GroupLabel>
        <Card palette={palette}>
          {trick.steps.map((step, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                gap: spacing.md,
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                borderBottomWidth: index < trick.steps.length - 1 ? 0.5 : 0,
                borderBottomColor: palette.separator,
              }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: palette.green,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>{index + 1}</Text>
              </View>
              <Text style={{ flex: 1, color: palette.text, fontSize: 15, lineHeight: 21 }}>{step}</Text>
            </View>
          ))}
        </Card>
      </View>

      <View>
        <GroupLabel palette={palette}>Example</GroupLabel>
        <View
          style={{
            borderRadius: radii.lg,
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.border,
            padding: spacing.lg,
          }}>
          <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{trick.example}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
