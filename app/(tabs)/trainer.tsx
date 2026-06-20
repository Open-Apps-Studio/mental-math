import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { SectionTitle } from '@/components/list';
import { WatermarkCard } from '@/components/watermark-card';
import { getPalette, radii, spacing } from '@/constants/theme';
import { BASIC_DOMAINS, NUMBER_TYPE_DOMAINS } from '@/data/domains';
import { useScheme } from '@/lib/settings';

export default function TrainerScreen() {
  const palette = getPalette(useScheme());
  const [tab, setTab] = useState<'standard' | 'custom'>('standard');

  const open = (domain: string) => router.push({ pathname: '/exercises/[domain]', params: { domain } });

  return (
    <Screen palette={palette} title="Trainer">
      <Segmented
        palette={palette}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'standard', label: 'Standard' },
          { value: 'custom', label: 'Custom' },
        ]}
      />

      {tab === 'standard' ? (
        <>
          <SectionTitle palette={palette} style={{ marginTop: spacing.sm }}>
            Basics
          </SectionTitle>
          {BASIC_DOMAINS.map((domain) => (
            <WatermarkCard
              key={domain.id}
              palette={palette}
              title={domain.card}
              watermark={domain.watermark}
              minHeight={84}
              onPress={() => open(domain.id)}
            />
          ))}

          <SectionTitle palette={palette} style={{ marginTop: spacing.sm }}>
            Number types
          </SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {NUMBER_TYPE_DOMAINS.map((domain) => (
              <WatermarkCard
                key={domain.id}
                palette={palette}
                title={domain.card}
                watermark={domain.watermark}
                onPress={() => open(domain.id)}
                style={{ width: '48%', flexGrow: 1 }}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <SectionTitle palette={palette} style={{ marginTop: spacing.sm }}>
            Custom drill
          </SectionTitle>
          <View
            style={{
              borderRadius: radii.lg,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              padding: spacing.lg,
              gap: spacing.sm,
            }}>
            <Text style={{ color: palette.text, fontSize: 17, fontWeight: '700' }}>Build your own mix</Text>
            <Text style={{ color: palette.textMuted, fontSize: 15, lineHeight: 21 }}>
              Pick any combination of operations and set the difficulty for each one. Great for targeting your weak spots.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {NUMBER_TYPE_DOMAINS.map((domain) => (
              <WatermarkCard
                key={domain.id}
                palette={palette}
                title={domain.card}
                sublabel={`${domain.exercises.length} operations`}
                watermark={domain.watermark}
                onPress={() => open(domain.id)}
                minHeight={104}
                style={{ width: '48%', flexGrow: 1 }}
              />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
