import { router } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '@/components/screen';
import { SectionTitle } from '@/components/list';
import { WatermarkCard } from '@/components/watermark-card';
import { getPalette, spacing } from '@/constants/theme';
import { CATEGORIES } from '@/data/knowledge';
import { useFavorites } from '@/lib/favorites';
import { useScheme } from '@/lib/settings';

export default function KnowledgeScreen() {
  const palette = getPalette(useScheme());
  const favorites = useFavorites();

  const plural = (n: number) => `${n} trick${n === 1 ? '' : 's'}`;

  return (
    <Screen palette={palette} title="Knowledge">
      <SectionTitle palette={palette}>Tricks</SectionTitle>

      <WatermarkCard
        palette={palette}
        title="Favorites"
        sublabel={plural(favorites.size)}
        watermark="★"
        filled
        minHeight={80}
        onPress={() => router.push({ pathname: '/tricks/[category]', params: { category: 'favorites' } })}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {CATEGORIES.map((category) => (
          <WatermarkCard
            key={category.id}
            palette={palette}
            title={category.title}
            sublabel={plural(category.tricks.length)}
            watermark={category.symbol}
            onPress={() => router.push({ pathname: '/tricks/[category]', params: { category: category.id } })}
            style={{ width: '48%', flexGrow: 1 }}
          />
        ))}
      </View>
    </Screen>
  );
}
