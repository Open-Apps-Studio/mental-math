import { Ionicons } from '@expo/vector-icons';
import * as StoreReview from 'expo-store-review';
import { Linking, Switch, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { Card, GroupLabel, Row } from '@/components/list';
import { Segmented } from '@/components/segmented';
import { getPalette, radii, spacing } from '@/constants/theme';
import { setSetting, ThemePref, useScheme, useSettings } from '@/lib/settings';

export default function SettingsScreen() {
  const palette = getPalette(useScheme());
  const settings = useSettings();

  return (
    <Screen palette={palette} title="Settings">
      <GroupLabel palette={palette}>Appearance</GroupLabel>
      <Segmented<ThemePref>
        palette={palette}
        value={settings.theme}
        onChange={(value) => setSetting('theme', value)}
        options={[
          { value: 'system', label: 'System' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />

      <View>
        <GroupLabel palette={palette}>Preferences</GroupLabel>
        <Card palette={palette}>
          <Row
            palette={palette}
            label="Haptic feedback"
            separator
            left={<Glyph palette={palette} name="phone-portrait-outline" color={palette.purple} />}
            right={<Switch value={settings.haptics} onValueChange={(v) => setSetting('haptics', v)} />}
          />
          <Row
            palette={palette}
            label="Sound effects"
            separator={false}
            left={<Glyph palette={palette} name="volume-high-outline" color={palette.blue} />}
            right={<Switch value={settings.sound} onValueChange={(v) => setSetting('sound', v)} />}
          />
        </Card>
      </View>

      <View>
        <GroupLabel palette={palette}>About</GroupLabel>
        <Card palette={palette}>
          <Row
            palette={palette}
            label="Rate OpenMath"
            separator
            left={<Glyph palette={palette} name="star-outline" color={palette.warning} />}
            chevron
            onPress={() => void StoreReview.requestReview().catch(() => {})}
          />
          <Row
            palette={palette}
            label="Privacy Policy"
            separator
            left={<Glyph palette={palette} name="lock-closed-outline" color={palette.textMuted} />}
            chevron
            onPress={() => void Linking.openURL('https://github.com/Open-Apps-Studio/openmath').catch(() => {})}
          />
          <Row
            palette={palette}
            label="Version"
            separator={false}
            left={<Glyph palette={palette} name="information-circle-outline" color={palette.textMuted} />}
            right={<Text style={{ color: palette.textMuted, fontSize: 15 }}>1.0.0</Text>}
          />
        </Card>
      </View>

      <Text style={{ color: palette.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.sm }}>
        OpenMath · Made for fast mental arithmetic
      </Text>
    </Screen>
  );
}

function Glyph({ palette, name, color }: { palette: ReturnType<typeof getPalette>; name: any; color: string }) {
  return (
    <View style={{ width: 30, height: 30, borderRadius: radii.sm, backgroundColor: `${color}22`, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={18} color={color} />
    </View>
  );
}
