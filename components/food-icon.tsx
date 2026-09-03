import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import type { Food } from '@/constants/foods';

export function FoodIcon({ food, size = 44 }: { food: Food; size?: number }) {
  if (food.image) {
    return (
      <Image
        source={food.image}
        contentFit="contain"
        style={{ width: size, height: size }}
        accessibilityLabel={`${food.name}图标`}
      />
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.78, lineHeight: size }}>{food.emoji}</Text>
    </View>
  );
}
