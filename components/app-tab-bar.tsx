import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppFonts } from '@/constants/theme';

const tabMeta: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  index: { label: '测量', icon: 'scale-outline' },
  trends: { label: '趋势', icon: 'stats-chart-outline' },
  more: { label: '更多', icon: 'list-outline' },
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        height: 82 + Math.max(insets.bottom, 8),
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 5,
      }}>
      <View
        style={{
          flex: 1,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
          borderRadius: 42,
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderWidth: 1,
          borderColor: '#F1F1F1',
          flexDirection: 'row',
          padding: 7,
        }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = tabMeta[route.name];
          if (!meta) return null;
          const options = descriptors[route.key].options;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? meta.label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
                void Haptics.selectionAsync();
              }}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 60,
                borderRadius: 34,
                backgroundColor: focused ? AppColors.text : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.65 : 1,
              })}>
              <Ionicons name={meta.icon} size={focused ? 29 : 27} color={focused ? 'white' : AppColors.text} />
              <Text
                style={{
                  marginTop: 2,
                  color: focused ? 'white' : AppColors.text,
                  fontFamily: AppFonts.medium,
                  fontSize: 12,
                }}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
