import { Pressable, Text, View } from 'react-native';
import { Palette, radii } from '@/constants/theme';

type Props<T extends string> = {
  palette: Palette;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

// iOS-style segmented control (the Standard / Custom toggle).
export function Segmented<T extends string>({ palette, options, value, onChange }: Props<T>) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: palette.track, borderRadius: radii.md, padding: 3 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 9,
              borderRadius: radii.md - 3,
              alignItems: 'center',
              backgroundColor: active ? palette.surface : 'transparent',
              opacity: pressed && !active ? 0.6 : 1,
              boxShadow: active ? '0 2px 6px rgba(0,0,0,0.12)' : undefined,
            })}>
            <Text style={{ color: active ? palette.text : palette.textMuted, fontWeight: active ? '700' : '500', fontSize: 14 }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
