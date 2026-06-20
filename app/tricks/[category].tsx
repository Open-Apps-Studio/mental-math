import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Card, GroupLabel, Row } from '@/components/list';
import { getPalette, radii, spacing } from '@/constants/theme';
import { allTricks, CATEGORIES, getCategory, Trick } from '@/data/knowledge';
import { useFavorites } from '@/lib/favorites';
import { useScheme } from '@/lib/settings';

export default function TrickListScreen() {
  const palette = getPalette(useScheme());
  const { category: categoryId } = useLocalSearchParams<{ category: string }>();
  const favorites = useFavorites();
  const isFavorites = categoryId === 'favorites';

  const title = isFavorites ? 'Favorites' : getCategory(categoryId)?.title ?? 'Tricks';
  const emoji = isFavorites ? '⭐' : getCategory(categoryId)?.emoji ?? '💡';
  const blurb = isFavorites ? 'Your saved tricks' : getCategory(categoryId)?.blurb ?? 'Tricks';

  // Rows as [categoryId, trick] so favorites can route back to the source category.
  const rows: { catId: string; trick: Trick }[] = isFavorites
    ? allTricks().filter(({ trick }) => favorites.has(trick.id)).map(({ category, trick }) => ({ catId: category.id, trick }))
    : (getCategory(categoryId)?.tricks ?? []).map((trick) => ({ catId: categoryId!, trick }));

  return (
    <ScrollView style={{ backgroundColor: palette.background }} contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
      <Stack.Screen
        options={{
          title,
          headerRight: () =>
            isFavorites ? null : (
              <Ionicons
                name="star-outline"
                size={22}
                color={palette.blue}
                onPress={() => router.push({ pathname: '/tricks/[category]', params: { category: 'favorites' } })}
              />
            ),
        }}
      />

      <View
        style={{
          height: 84,
          borderRadius: radii.lg,
          backgroundColor: palette.green,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ fontSize: 40 }}>{emoji}</Text>
      </View>

      <View>
        <GroupLabel palette={palette}>{blurb}</GroupLabel>
        {rows.length === 0 ? (
          <Card palette={palette}>
            <View style={{ padding: spacing.lg, alignItems: 'center', gap: spacing.xs }}>
              <Text style={{ color: palette.text, fontSize: 16, fontWeight: '600' }}>No favorites yet</Text>
              <Text style={{ color: palette.textMuted, fontSize: 14, textAlign: 'center' }}>
                Open any trick and tap the star to save it here.
              </Text>
            </View>
          </Card>
        ) : (
          <Card palette={palette}>
            {rows.map(({ catId, trick }, index) => (
              <Row
                key={trick.id}
                palette={palette}
                label={trick.title}
                separator={index < rows.length - 1}
                onPress={() => router.push({ pathname: '/trick', params: { category: catId, id: trick.id } })}
                chevron
                left={<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: palette.green }} />}
              />
            ))}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
